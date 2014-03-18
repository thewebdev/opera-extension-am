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
	Email: thewebdev@yandex.com */

var timeIt = null; // data refresh timer
var slider; // slide time delay
var data; // scraped adsense page
var rate; // parsed currency rates

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

function trueRound(value) {
/*  Original code from stackoverflow.com 
	Rounds a float to specified number of decimal places */

	var digits = 2;
    return (Math.round((value * Math.pow(10, digits)).toFixed(digits - 1)) / Math.pow(10, digits)).toFixed(digits);
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
		
		$("rateSlides").className = "";
		
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
	   scrape the earnings data, else ask
	   user to log in. */
	   
	var login;
	var div;
	var gcode;
	var now, y, tm, lm, dComp, mComp, tue, te;
	var eto, emo, etu;
	var out = [];
	
	var edaily = parseInt(widget.preferences.edaily, 10);
	var emonthly = parseInt(widget.preferences.emonthly, 10);
	var etotal = parseInt(widget.preferences.etotal, 10);
	
	var slideshow = parseInt(widget.preferences.slideshow, 10);
	var convert = parseInt(widget.preferences.convert, 10);
	
	if (input) {
	/*  parse the scraped page we got from Google */
		
		/* extract <body> element from scraped page */
		gcode = input.substring(input.indexOf("<body>")+7, input.indexOf("</body>"));
        opera.postError(gcode);
        return;        
		
		/* We extract data based on the id's. 
		   To do this efficiently, we use
		   querySelector(), which works on DOM, 
		   elements and document fragments. So we
		   create an element, append the elements 
		   from the scraped page and search for
		   known ids using querySelector(). */
		   
		div = E('div');
		div.innerHTML = input;
		
		/* the login form has an id called 'gaia_loginform' */
		login = div.querySelector("#gaia_loginform");
		
		if (login) {		
			/* login form detected */
			
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
			
			if (edaily) {
				/* Daily earnings data */
				
				/* extract the earning data using the 
				   obvious ids */
				   
				now = div.querySelector("#earnings-today").firstChild.nodeValue;
				y = div.querySelector("#earnings-yesterday").firstChild.nodeValue;

				/* check if earning data is more or
				   less than previous day's earning */
				if ((parseFloat(now.substr(1))) < (parseFloat(y.substr(1)))) {
					dComp = "down";
				} else {
					dComp = "up";
				}
				
				if (convert) {
					now = now.trim();
					y = y.trim();
					
					// remove dollar / euro symbol
					now = now.slice(1);
					y = y.slice(1);
					
					// convert to local currency
					now = parseFloat(now) * rate;
					y = parseFloat(y) * rate;
					
					// roundoff to 2 decimals
					now = trueRound(now);
					y = trueRound(y);
					
					now = String(now);
					y = String(y);
				}
				
				eto = ['today', dComp, now, 'yesterday', y];
				out.push(eto);
			}
			
			if (emonthly) {
				/* Daily earnings data */
				
				/* extract the earning data using the 
				   obvious id's */
				   
				
				tm = div.querySelector("#earnings-this-month").firstChild.nodeValue;
				lm = div.querySelector("#earnings-last-month").firstChild.nodeValue;
		

				/* check if earning data is more or
				   less than previous month's earning */			
				if ((parseFloat(tm.substr(1))) < (parseFloat(lm.substr(1)))) {
					mComp = "down";
				} else {
					mComp = "up";
				}
				
				if (convert) {
					tm = tm.trim();
					lm = lm.trim();
					
					// remove dollar / euro symbol
					tm = tm.slice(1);
					lm = lm.slice(1);
					
					// convert to local currency
					tm = parseFloat(tm) * rate;
					lm = parseFloat(lm) * rate;
					
					// roundoff to 2 decimals
					tm = trueRound(tm);
					lm = trueRound(lm);
					
					tm = String(tm);
					lm = String(lm);
				}				

				emo = ['this month', mComp, tm, 'last month', lm];
				out.push(emo);
			}
			
			if (etotal){
				/* get total unpaid earnings - this
				   is slightly tricky as there is no
				   obvious id to search for this data */
				
				tue = div.querySelectorAll('ul.metrics-list li:first-of-type span.value');
				te = tue[1].firstChild.nodeValue;
				
				if (convert) {
					te = te.trim();
					
					// remove dollar / euro symbol
					te = te.slice(1);
					
					// convert to local currency
					te = parseFloat(te) * rate;
					
					// roundoff to 2 decimals
					te = trueRound(te);
					
					te = String(te);
				}				
				
				etu = ['total', 'up', te, 'unpaid earnings'];
				out.push(etu);
			}
			
			if (slideshow) {
				refDial('slides', out);
			} else {
				refDial('showall', out);
			}
		}
	}
	
	return;
}

function converter(file, arc, luc) {
	/* Currency conversion */
	
	var csv = file.split(/\r?\n/);
	var rates;
	
	if (arc === 'USD') {
		rates = csv[0].split(',');
		rate = parseFloat(rates[1]);
	}
	
	if (arc === 'EUR') {
		rates = csv[0].split(',');
		rates = rates.concat(csv[1].split(','));
		rate = parseFloat(rates[3]) / parseFloat(rates[1]);
	}
	
	return;
}

function getRates() {
	/* Get currency rate from Yahoo! */
	
	var csvfile;
	var query;
	var url = 'http://download.finance.yahoo.com/d/quotes.csv?f=sl1&e=.cs&s=';
	
	refDial('wait');
	
	var arc = widget.preferences.arc;
	var luc = widget.preferences.luc;
	
	if (arc === 'USD') {
		query = arc + luc + '=X';
	} 
	
	if (arc === 'EUR') {
		query = 'USDEUR=X&s=USD' + luc + '=X';
	}
	
	url = url + query;
	
	var ext = new XMLHttpRequest();

	ext.open('GET', url, true);
	
	ext.onreadystatechange = function (event) {
		if (this.readyState == 4) {
			if (this.status == 200 && this.responseText) {
				csvfile = this.responseText;
				converter(csvfile, arc, luc);
			} else {
				/* possible network error -
				   tell the user. */
				
				refDial('hang');
			}
		}
	};

	ext.send();
	return;
}

function scrapeAPI(input) {
    var lfedata, url, xhr, a, b, c, onLoad, data;
    
    lfedata = input.substring(input.indexOf("ads.adsense.lightfe.main.init")+31, input.indexOf("ads.adsense.lightfe.home.loadData"));
    
    //opera.postError("1: " + lfedata);
    
    lfedata = lfedata.split(",");
    
    lfedata[0] = lfedata[0].trim();
    lfedata[1] = lfedata[1].trim();
    lfedata[0] = lfedata[0].substring(lfedata[0].indexOf("\'")+1, lfedata[0].lastIndexOf("\'"));
    lfedata[1] = lfedata[1].substring(lfedata[1].indexOf("\'")+1, lfedata[1].lastIndexOf("\'"));
    
    opera.postError("2: " + lfedata[0]);
    opera.postError("3: " + lfedata[1]);
    
    url = "https://www.google.com/adsense/m/data/home?hl=" + lfedata[0];
    xhr = new XMLHttpRequest();
    
    onLoad = function(e) {
        data = e.target.responseText;
        data = data.substring(data.indexOf("{"), data.length);
        opera.postError("JSON: " + data);
    };
    
    a = '';
    c = ''+"="+b;
    xhr.open('POST', url, true);
    xhr.timeout = 10000;
    xhr.withCredentials = true;
    xhr.setRequestHeader("Referer", "https://www.google.com/adsense/m/");
    xhr.setRequestHeader("Content-Length", "0");    
    xhr.setRequestHeader("X-Lightfe-Auth", "1");
    xhr.setRequestHeader("Client-Version", lfedata[1]);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
    
    xhr.send(c);
    
    xhr.onload = onLoad;
}

function getReport() {
	/* Scrape the mobile version of 
	   Google Adsense Control Panel. */
//
	var url = "https://www.google.com/adsense/m/";
	
	refDial('wait');
	
    var ext = new XMLHttpRequest();
	ext.open('GET', url, true);
    
	ext.onload = function (event) {
        if (this.status == 200) {
            data = this.responseText;
            //opera.postError("Scrape: " + data);
            scrapeAPI(data);
		  //extract(data);
        }
	};

	ext.send();
}

function scrape() {
	/* get the data */
	
	var convert = parseInt(widget.preferences.convert, 10);
	if (convert) {
		getRates();
	}
	
	getReport();
}

function refDial(cmd, out) {
	/* Used to show the output
	   in the speed dial. */
	
	if (cmd == "slides") {
		/* Displays each data individually 
		   in the speed dial as slides
		   in a presentation. */
		
		var dt, dd, temp;
		
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
				dt[o].innerHTML = '<span class="etype">' + out[o][0] + '</span><br /><span class="' + out[o][1] + '">' +  out[o][2] + '<span>';
			} 
			
			if (dd[o]) {
				/*  reset css class */
				dd[o].className = "";	
				/*  assign the new data */
				temp = '';
				if (out[o][4]) { temp = ': ' + out[o][4]; }
				dd[o].innerHTML = out[o][3] + temp;
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
	
	if (cmd == "showall") {
		/* Displays all the data in 1 slide. */
		
		var dt, dd, temp;
		
		clearInterval(slider);	
		
		/* create the definition list
		   structure used to show the data. */
		createDl(out.length);
		
		/* set style to display as table */
		$("rateSlides").className = "table-display";
		
		dt = $("rateSlides").getElementsByTagName('dt');
		dd = $("rateSlides").getElementsByTagName('dd');
		
		for (var o = 0; o < out.length; o++) {
			/*  add data */
			
			if (dt[o]) {
				/*  reset css class */
				dt[o].className = "current";
				/*  assign the new data */
				switch(out[o][0]) {
					case 'today': temp = 'day: '; break;
					case 'this month': temp = 'month: '; break;
					case 'total': temp = 'total: '; break;
				}
				dt[o].innerHTML = '<span class="ttitle">' + temp + ' </span>';
			} 
			
			if (dd[o]) {
				/*  reset css class */
				dd[o].className = "current";	
				/*  assign the new data */				
				temp = '';
				if (out[o][4]) { temp = ' vs ' + out[o][4]; }
				dd[o].innerHTML = '<span class="' + out[o][1] + '">' +  out[o][2] + '</span>' + temp;
			}			
		}
		
		hide("wait");
		show("data");

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

function reconfigure(e) {
	/* This code didn't work as expected.
	   Needs more testing to figure out if
	   it was some opera bug. It's here as 
	   as a stub for future versions.
	   It is meant to update the speed dial
	   with the new options set by the user. */
	
	var gac = data;
	if (e.storageArea != widget.preferences) return;
	switch(e.key) {
		case 'interval': setRefreshTimer(); break;
		case 'showfor': setDisplayTimer(); break;
		case 'edaily': extract(gac); break;
		case 'emonthly': extract(gac); break;
		case 'etotal': extract(gac); break;
		case 'slideshow': extract(gac); break;
	}
}

function setRefreshTimer() {
	clearInterval(timeIt); 
	timeIt = setInterval(scrape, parseInt((widget.preferences.interval), 10) * 60 * 1000);
}

function setDisplayTimer() {
	clearInterval(slider);
	slider = setInterval(startSlide, parseInt((widget.preferences.showfor), 10) * 1000);
}

function init() {
	/* some basic settings intialised here
	   to get the extension running */

	/* monitors if options are updated and 
	   saved in widget preferences. */
	window.addEventListener('storage', reconfigure, false);	   
	
	/* The 'interval' key in the preferences 
	   specifies the delay between updates.
	   Unit: minute */
	timeIt = setInterval(scrape, parseInt((widget.preferences.interval), 10) * 60 * 1000);
	scrape();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);