/*  This file is part of Google Adsense Monitor. Google Adsense Monitor
	is an Opera extension that lets you view updates to your latest 
	adsense earnings in an Opera Speed Dial.
	
    Copyright (C) 2013 - 2014 M Shabeer Ali

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
	Email: thewebdev@yandex.com 
*/

/*jslint plusplus: true, continue: true */
/*global document: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false, XMLHttpRequest: false, localStorage: false, window: false, chrome: false, opera: false, widget: false, ErrorEvent: false */

"use strict";

var update = 0;

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
	
	var checketo, checkemo, checketu, checkass, checkalc, i, d, save, arc, luc;
	
    save = false;

	checketo = document.input.eto.checked;
	checketo = checketo ? 1 : 0;
	
	checkemo = document.input.emo.checked;
	checkemo = checkemo ? 1 : 0;
	
	checketu = document.input.etu.checked;
	checketu = checketu ? 1 : 0;
	
	checkass = document.input.ass.checked;
	checkass = checkass ? 1 : 0;
	
	checkalc = document.input.alc.checked;
	checkalc = checkalc ? 1 : 0;

	/* Validate - Atleast one item 
	   needs to be displayed. */
	
	if ((checketo === 0) && (checkemo === 0) && (checketu === 0)) {
		status("Error: Atleast ONE type of earnings should be selected.");
		return;
	}
	
	i = document.input.interval.value;
	i = parseInt(i, 10);

	if (!i) {
		/* Validation - interval should be a number */
		status("Error: Update interval should be a number");
		return;
	} else {
		document.input.interval.value = i;
	}
	
	if (i < 30) {
		/* Validation - interval cannot be less than 15 */
		status("Error: Update interval should be more than 15 minutes.");
		return;
	}

	d = document.input.delay.value;
	d = parseInt(d, 10);
	
	if ((!d) && (d !== 0)) {
		/* Validation - delay should be a number */
		status("Error: Display delay should be a number");
		return;
	} else {
		document.input.delay.value = d;
	}
	
	if (d <= 0) {
		/* Validation - delay cannot be less than 1 */
		status("Error: Display delay can't be less than 1 second.");
		return;
	}
	
	/* save changes */
	widget.preferences.edaily = checketo;
	widget.preferences.emonthly = checkemo;
	widget.preferences.etotal = checketu;
	widget.preferences.slideshow = checkass;
	widget.preferences.interval = i;
	widget.preferences.convert = checkalc;
	
	if (checkass) {
		widget.preferences.showfor = d;
	}
	
	if (checkalc) {
	
		arc = document.input.first.value;
		luc = document.input.second.value;
		
		// Adsense Report Currency
		widget.preferences.arc = arc;
		
		//Local User Currency
		widget.preferences.luc = luc;
		
		opera.extension.bgProcess.scrape();
	}
	
	if (checkalc !== update) {
		update = checkalc;
		opera.extension.bgProcess.scrape();
	}
	
	status("All changes saved.");
	
	return;
}

function disable() {
	var check;
	
	check = document.input.ass.checked;
	check = check ? 1 : 0;
	
	if (!check) {
		document.input.delay.disabled = true;
	} else {
		document.input.delay.disabled = false;
	}
}

function nocurrency() {
	var check;
	
	check = document.input.alc.checked;
	check = check ? 1 : 0;
	
	if (check) {
		document.input.first.disabled = false;
		document.input.second.disabled = false;
	} else {
		document.input.first.disabled = true;
		document.input.second.disabled = true;
	}
}

function load() {
	/* Loads the saved values and displays 
	   it to the user for making changes. */
    
    var edaily, emonthly, etotal, slideshow, interval, showfor, convert;
	
	edaily = parseInt(widget.preferences.edaily, 10);
	emonthly = parseInt(widget.preferences.emonthly, 10);
	etotal = parseInt(widget.preferences.etotal, 10);
	
	slideshow = parseInt(widget.preferences.slideshow, 10);
	interval = widget.preferences.interval;
	showfor = widget.preferences.showfor;
	
    convert = parseInt(widget.preferences.convert, 10);
	
	
	if (edaily) { document.input.eto.checked = true; }
	if (emonthly) { document.input.emo.checked = true; }
	if (etotal) {document.input.etu.checked = true;	}
	if (slideshow) {document.input.ass.checked = true; }
	
	if (convert) {
		update = 1;
		document.input.alc.checked = true;
	}
	
	document.input.interval.value = interval;
	document.input.delay.value = showfor;

	$('first').value = widget.preferences.arc;
	$('second').value = widget.preferences.luc;
	
	disable();
	nocurrency();
}

function init() {
	/* some basic settings intialised here */
	
	/* monitor clicks */
	$('apply').addEventListener('click', apply, false);
	$('ass').addEventListener('click', disable, false);
	$('alc').addEventListener('click', nocurrency, false);
	
	load();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);