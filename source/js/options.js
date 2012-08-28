/*  This file is part of Google Adsense Monitor. Google Adsense Monitor
	is an Opera extension that lets you view updates to your latest 
	adsense earnings in an Opera Speed Dial.
	
    Copyright (C) 2012 M Shabeer Ali

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
	Website: http://adsensemonitor.tumblr.com/
	Source code: https://github.com/thewebdev/opera-extension-am.git
	Email: thewebdev@myopera.com 
*/

function $(v) {
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function hide(id) {
	$(id).style.display = 'none';
}

function show(id) {
	$(id).style.display = 'block';
}	

function status(msg) {
	/* Used to display messages
	   to the user */
	   
	var hangTimer;
	
	$("msg").firstChild.nodeValue = msg;
	show("msg");
	
	/* show status update for 7 seconds */
	clearTimeout(hangTimer);
	hangTimer = setTimeout(function () {
		hide("msg");
	}, 7000);	
}

function apply() {
	/* Saves the changes permanently */
	
	var checketo, checkemo, checketu;

	checketo = document.input.eto.checked;
	checketo = checketo ? 1 : 0;
	
	checkemo = document.input.emo.checked;
	checkemo = checkemo ? 1 : 0;
	
	checketu = document.input.etu.checked;
	checketu = checketu ? 1 : 0;

	/* Validate - Atleast one item 
	   needs to be displayed. */
	
	if ((checketo == 0) && (checkemo == 0) && (checketu == 0)) {
		status("Error: Atleast ONE type of earnings should be selected.");
		return;
	}
	
	/* save changes */
	widget.preferences.edaily = checketo;
	widget.preferences.emonthly = checkemo;
	widget.preferences.etotal = checketu;
	
	status("All changes saved.");

	/* reload dial with new settings */		
	opera.extension.bgProcess.init();	
	
	return;
}

function load() {
	/* Loads the saved values and displays 
	   it to the user for making changes. */ 
	
	var edaily = parseInt(widget.preferences.edaily, 10);
	var emonthly = parseInt(widget.preferences.emonthly, 10);
	var etotal = parseInt(widget.preferences.etotal, 10);
	
	if (edaily) { document.input.eto.checked = true; } 
	if (emonthly) { document.input.emo.checked = true; } 
	if (etotal) {document.input.etu.checked = true;	} 
}

function submit() {
	/* When ENTER key is pressed on any form input,
	   the form got submitted and results in a 
	   page reload. However, it seems this form
	   reload browser quirk, sometimes doesn't
	   happen if there are more than one
	   input element. Since options.html now
	   has more than 1 input element, this event
	   doesn't seem to be triggering. This code may
	   no longer be necessary, but since I am 
	   feeling lazy to test this quirk more 
	   thoroughly this remains for now. */
	   
	if (document.input.remind.value) {
		addNote();
	}
	return false;
}

function init() {
	/* some basic settings intialised here */
	
	/* monitor for button clicks */
	$('input').addEventListener('submit', submit, false);
	$('apply').addEventListener('click', apply, false);
	
	load();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);