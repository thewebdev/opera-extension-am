﻿/*  This file is part of Google Adsense Monitor. Google Adsense Monitor
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
	Email: thewebdev@myopera.com */

var timeIt = null; // data refresh timer
var slider; // slide time delay

function $(v) {
	/* DOM: identifies element */
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function E(v) {
	/* DOM: creates new element */
	return document.createElement(v);
}

function Txt(v) {
	/* DOM: creates text nodes */
	return document.createTextNode(v);
}

function hide(id) {
	$(id).style.display = 'none';
}

function show(id) {
	$(id).style.display = 'block';
}

function createDl(kids) {
/*  Creates the definition list used to
	display the data in the speed dial.
	The 'kids' parameter specifies how
	many nodes (dt dd pair) to create.
	Once the definition list is created,
	the function only adds or deletes
	dt dd node pairs as necessary.
	Opera recommends using createDocumentFragment()
	as it is faster to create the elements
	separately and then add to the page. */
	
	var dl, dt, dd, txt, temp, temp1;
	var inHtml = document.createDocumentFragment();
	var list = $("rateSlides");
	
	if ($("rateSlides")) {
		/*  if dl node exists */
		
		temp = $("rateSlides").getElementsByTagName('dt');
		
		if (temp.length === kids) {
			return;
		} else if (temp.length < kids) {
			/*  add more dt dd nodes */
			
			var z = kids - temp.length;
			
			for (var a = 0; a < z; a++) {
				dt = E('dt');
				txt = Txt('');
				dt.appendChild(txt);
				
				inHtml.appendChild(dt);
				
				dd = E('dd');
				txt = Txt('');
				dd.appendChild(txt);
				
				inHtml.appendChild(dd);				
			}
			
			$("rateSlides").appendChild(inHtml);
			return;
			
		} else if (temp.length > kids) {
			/*  delete some dt dd nodes */
			
			temp1 = $("rateSlides").getElementsByTagName('dd');
			
			var x = temp.length - kids;
			
			while (x !== 0) {
				$("rateSlides").removeChild(temp[0]);
				$("rateSlides").removeChild(temp1[0]);
				x -= 1;
			}
			
			return;
		}
	} 
	
	/*  create the list and add to the DOM */
		
	dl = E('dl');
	dl.setAttribute('id', 'rateSlides');
	
	for (var i = 0; i < kids; i++) {
		dt = E('dt');
		txt = Txt('');
		dt.appendChild(txt);
		
		dl.appendChild(dt);
		
		dd = E('dd');
		txt = Txt('');
		dd.appendChild(txt);
		
		dl.appendChild(dd);
	}

	inHtml.appendChild(dl);
	$('data').appendChild(inHtml);
	
	return;
}

function extract(input) {
	/* Checks if user has logged into Google
	   Adsense control panel. If logged in,
	   scrape the earning data, else ask
	   user to log in. */
	   
	var login;
	var div;
	var gcode;
	var now, y, tm, lm, dComp, mComp;
	var out = [];
	
	if (input) {
	/*  parse the scraped page we got from Google */
		
		/* extract <body> element from scraped page */
		gcode = input.substring(input.indexOf("<body>")+7, input.indexOf("</body>"));
		
		/* We extract data based on  the id's. 
		   To do this efficiently, we use
		   querySelector(), which works on DOM, 
		   elements and document fragments. So we
		   create an element, append the elements 
		   from the scraped page and search for
		   known id's using querySelector(). */
		   
		div = E('div');
		div.innerHTML = input;
		
		/* the login form has an id called 'gaia_loginform' */
		login = div.querySelector("#gaia_loginform");
		
		if (login) {		
			/* login form detercted */
			
			/* inform user to login */
			refDial('login');
			
			/* reset refresh timer to check every 2 
			   minute if user has logged in */
			clearInterval(timeIt);   
			timeIt = setInterval(scrape, parseInt(2, 10) * 60 * 1000);
			
		} else {
			/* user is logged in */
			
			refDial('wait');
			
			/* reset refresh timer to default setting */
			clearInterval(timeIt);   
			timeIt = setInterval(scrape, parseInt((widget.preferences.interval), 10) * 60 * 1000);	
			
			/* extract the earning data using the 
			   obvious id's */
			   
			now = div.querySelector("#earnings-today").firstChild.nodeValue;
			y = div.querySelector("#earnings-yesterday").firstChild.nodeValue;
			tm = div.querySelector("#earnings-this-month").firstChild.nodeValue;
			lm = div.querySelector("#earnings-last-month").firstChild.nodeValue;
			
			/* check if earning data is more or
			   less than previous day's earning */
			if ((parseFloat(now.substr(1))) < (parseFloat(y.substr(1)))) {
				dComp = "down";
			} else {
				dComp = "up";
			}

			/* check if earning data is more or
			   less than previous month's earning */			
			if ((parseFloat(tm.substr(1))) < (parseFloat(lm.substr(1)))) {
				mComp = "down";
			} else {
				mComp = "up";
			}			
			
			/* prepare for output */
			out = [[now, dComp, 'yesterday', y], 
				   [tm, mComp, 'last month', lm]];
				   
			refDial('show', out);
		}
	}
	
	return;
}

function scrape() {
	/* Scrape the mobile version of 
	   Google Adsense Control Panel. */
	
	var data;
	var url = "https://www.google.com/adsense/v3/m/home";
	
	refDial('wait');
	var ext = new XMLHttpRequest();

	ext.open('GET', url, true);
	
	ext.onreadystatechange = function (event) {
		if (this.readyState == 4) {
			if (this.status == 200 && this.responseText) {
				data = this.responseText;
				extract(data);
			} else {
				/* possible network error -
				   tell the user. */
				
				refDial('hang');
			}
		}
	};

	ext.send();	
	return data;
}

function refDial(cmd, out) {
	/* Used to show the output
	   in the speed dial. */
	
	if (cmd == "show") {
		/* prepare the earning data
		   for display */
		
		var dt, dd;
		
		clearInterval(slider);	
		
		/* create the definition list
		   structure used to show the data. */
		createDl(out.length);
		
		dt = $("rateSlides").getElementsByTagName('dt');
		dd = $("rateSlides").getElementsByTagName('dd');
		
		for (var o = 0; o < out.length; o++) {
			/*  add data */
			
			if (dt[o]) {
				/*  reset css class */
				dt[o].className = "";
				/*  assign the new data */
				dt[o].innerHTML = '<span class="' + out[o][1] + '">' +  out[o][0] + '<span>';
			} 
			
			if (dd[o]) {
				/*  reset css class */
				dd[o].className = "";	
				/*  assign the new data */				
				dd[o].innerHTML = out[o][2] + ': ' + out[o][3];
			}			
		}
		
		dt[0].className = 'current';
		dd[0].className = 'current';
		
		hide("wait");
		show("data");
		
		/* set display delay between pair*/
		slider = setInterval(startSlide, parseInt((widget.preferences.showfor), 10) * 1000);
		
		/*  start displaying the data */
		startSlide(out.length);
		return;
	}

	if (cmd == "login") {
		/* tell the user to login */

		$("msg").firstChild.nodeValue = "please login";

		clearInterval(slider);			
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd == "wait") {
		/* used to indicate that an
		   update of data is underway */

		$("msg").firstChild.nodeValue = "updating";

		clearInterval(slider);			
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd == "hang") {
		/* indicate some error
		   has occured */

		$("msg").firstChild.nodeValue = "Possible network error. Will retry again later.";
		
		clearInterval(slider);	
		hide("data");
		show("wait");		
		
		return;
	} 
}

function startSlide(count) {
	/* Displays the data.
	   Cycles through each dt dd pair
	   and marks it with css class name 
	   'current'. Pairs marked 'current'
	   are displayed, while others stay
	   hidden, using css. */
	
	var cls;
	var dt;
	var dd;
	var done;
	var tempDt;
	var tempDd;
	
	done = false;
	tempDt = [];
	tempDd = [];

	dt = $("rateSlides").getElementsByTagName('dt');
	dd = $("rateSlides").getElementsByTagName('dd');

	for (var e=0; e < dt.length; e++) {
		/* Opera recommends making changes to 
		   a copy of the DOM */
		tempDt[tempDt.length] = dt[e];
	}
	
	for (var i = 0; i < tempDt.length; i++) {
		if (done) { 
			/* Once a dt element has been marked
			   'current', no need to go through
			   the rest of it as we display only
			   one dt element at a time. */
			
			continue; 
		}
		
		cls = tempDt[i].className;
		
		if ((cls.indexOf("current")) != -1) {
			
			/*  unmark the currently displayed dt */
			tempDt[i].className = "";
			
			if (i == (tempDt.length-1)) {
				/* if we have reached the last 
				   dt, mark the first dt again. */
			
				tempDt[0].className = 'current';
			} else {
				tempDt[i+1].className = 'current';
			}
			
			done = true;
		}
	}

	tempDt = null;
	done = false;

	/* do the same thing for dd element
	   as we did for the dt element in
	   the code above. */
	
	for (var s=0; s < dd.length; s++) {
		tempDd[tempDd.length] = dd[s];
	}
	
	for (var t = 0; t < tempDd.length; t++) {
		if (done) { continue; }
		
		cls = tempDd[t].className;
		
		if ((cls.indexOf("current")) != -1) {
			
			tempDd[t].className = "";

			if (t === (tempDd.length-1)) {
				tempDd[0].className = 'current';
			} else {
				tempDd[t+1].className = 'current';
			}
			
			done = true;
		}
	}
	
	tempDd = null;
}

function init() {
	/* some basic settings intialised here
	   to get the extension running */
		
	
	/* The 'interval' key in the preferences 
	   specifies the delay between updates.
	   Unit: minute */
	timeIt = setInterval(scrape, parseInt((widget.preferences.interval), 10) * 60 * 1000);
	
	scrape();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);