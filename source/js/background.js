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

/*jslint plusplus: true, continue: true */
/*global document: false, clearInterval: false, clearTimeout: false, setInterval: false, setTimeout: false, XMLHttpRequest: false, localStorage: false, window: false, chrome: false, opera: false, widget: false, ErrorEvent: false */

"use strict";

var timeIt = null; // data refresh timer
var slider; // slide time delay
var data; // raw adsense data
var total; // total unpaid earning
var out; // output data
var rate; // parsed currency rates

function $(v) {
	/* DOM: identifies element */
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function e(v) {
	/* DOM: creates new element */
	return document.createElement(v);
}

function txt(v) {
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

	var digits;
    
    digits = 2;
    return (Math.round((value * Math.pow(10, digits)).toFixed(digits - 1)) / Math.pow(10, digits)).toFixed(digits);
}

function scrape() {
	/* get the data */
    
	getPage();
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
	
	var dl,
        dt,
        dd,
        tx,
        temp,
        temp1,
        inHtml,
        list,
        z,
        a,
        x,
        i;
	
    inHtml = document.createDocumentFragment();
	list = $("rateSlides");
	
	if ($("rateSlides")) {
		/*  if dl node exists */
		
		$("rateSlides").className = "";
		
		temp = $("rateSlides").getElementsByTagName('dt');
		
		if (temp.length === kids) {
			return;
		} else if (temp.length < kids) {
			/*  add more dt dd nodes */
			
			z = kids - temp.length;
			
			for (a = 0; a < z; a++) {
				dt = e('dt');
				tx = txt('');
				dt.appendChild(tx);
				
				inHtml.appendChild(dt);
				
				dd = e('dd');
				tx = txt('');
				dd.appendChild(tx);
				
				inHtml.appendChild(dd);
			}
			
			$("rateSlides").appendChild(inHtml);
			return;
			
		} else if (temp.length > kids) {
			/*  delete some dt dd nodes */
			
			temp1 = $("rateSlides").getElementsByTagName('dd');
			
			x = temp.length - kids;
			
			while (x !== 0) {
				$("rateSlides").removeChild(temp[0]);
				$("rateSlides").removeChild(temp1[0]);
				x -= 1;
			}
			
			return;
		}
	}
	
	/*  create the list and add to the DOM */
		
	dl = e('dl');
	dl.setAttribute('id', 'rateSlides');
	
	for (i = 0; i < kids; i++) {
		dt = e('dt');
		tx = txt('');
		dt.appendChild(tx);
		
		dl.appendChild(dt);
		
		dd = e('dd');
		tx = txt('');
		dd.appendChild(tx);
		
		dl.appendChild(dd);
	}

	inHtml.appendChild(dl);
	$('data').appendChild(inHtml);
	
	return;
}

function startSlide(count) {
	/* Displays the data.
	   Cycles through each dt dd pair
	   and marks it with css class name 
	   'current'. Pairs marked 'current'
	   are displayed, while others stay
	   hidden, using css. */
	
	var cls,
        dt,
        dd,
        done,
        tempDt,
        tempDd,
        e,
        i,
        s,
        t;
	
	done = false;
	tempDt = [];
	tempDd = [];

	dt = $("rateSlides").getElementsByTagName('dt');
	dd = $("rateSlides").getElementsByTagName('dd');

	for (e = 0; e < dt.length; e++) {
		/* Opera recommends making changes to 
		   a copy of the DOM */
		tempDt[tempDt.length] = dt[e];
	}
	
	for (i = 0; i < tempDt.length; i++) {
		if (done) {
			/* Once a dt element has been marked
			   'current', no need to go through
			   the rest of it as we display only
			   one dt element at a time. */
			
			continue;
		}
		
		cls = tempDt[i].className;
		
		if ((cls.indexOf("current")) !== -1) {
			
			/*  unmark the currently displayed dt */
			tempDt[i].className = "";
			
			if (i === (tempDt.length - 1)) {
				/* if we have reached the last 
				   dt, mark the first dt again. */
			
				tempDt[0].className = 'current';
			} else {
				tempDt[i + 1].className = 'current';
			}
			
			done = true;
		}
	}

	tempDt = null;
	done = false;

	/* do the same thing for dd element
	   as we did for the dt element in
	   the code above. */
	
	for (s = 0; s < dd.length; s++) {
		tempDd[tempDd.length] = dd[s];
	}
	
	for (t = 0; t < tempDd.length; t++) {
		if (done) { continue; }
		
		cls = tempDd[t].className;
		
		if ((cls.indexOf("current")) !== -1) {
			
			tempDd[t].className = "";

			if (t === (tempDd.length - 1)) {
				tempDd[0].className = 'current';
			} else {
				tempDd[t + 1].className = 'current';
			}
			
			done = true;
		}
	}
	
	tempDd = null;
}

function setRefreshTimer(time) {
	clearInterval(timeIt);
	timeIt = setInterval(scrape, time * 60 * 1000);
}

function refDial(cmd) {
	/* Used to show the output
	   in the speed dial. */
	
    var dt,
        dd,
        temp,
        o;
    
	if (cmd === "slides") {
		/* Displays each data individually 
		   in the speed dial as slides
		   in a presentation. */
		
		clearInterval(slider);
		
		/* create the definition list
		   structure used to show the data. */
		createDl(out.length);
		
		dt = $("rateSlides").getElementsByTagName('dt');
		dd = $("rateSlides").getElementsByTagName('dd');
		
		for (o = 0; o < out.length; o++) {
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
        
        /*  reset timer if we are
            recovering from login or
            network error */
        
        setRefreshTimer(parseInt((widget.preferences.interval), 10));
        
		return;
	}
	
	if (cmd === "showall") {
		/* Displays all the data in 1 slide. */
		
		clearInterval(slider);
		
		/* create the definition list
		   structure used to show the data. */
		createDl(out.length);
		
		/* set style to display as table */
		$("rateSlides").className = "table-display";
		
		dt = $("rateSlides").getElementsByTagName('dt');
		dd = $("rateSlides").getElementsByTagName('dd');
		
		for (o = 0; o < out.length; o++) {
			/*  add data */
			
			if (dt[o]) {
				/*  reset css class */
				dt[o].className = "current";
				/*  assign the new data */
				switch (out[o][0]) {
                case 'today':
                    temp = 'day: ';
                    break;
				case 'this month':
                    temp = 'month: ';
                    break;
				case 'total':
                    temp = 'total: ';
                    break;
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

        /*  reset timer if we are
            recovering from login or
            network error */
        
        setRefreshTimer(parseInt((widget.preferences.interval), 10));
        
		return;
	}

	if (cmd === "login") {
		/* tell the user to login */
        
        $("indicator").setAttribute("src", "../pix/wait.gif");
		$("msg").innerHTML = "Please login" + "<br \\>" + "(and wait 2 minutes)";

		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd === "wait") {
		/* used to indicate that an
		   update of data is underway */
        
        $("indicator").setAttribute("src", "../pix/loading.gif");
		$("msg").innerHTML = "updating";

		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
    
	if (cmd === "nodata") {
		/* indicate some error
		   has occured */

        $("indicator").setAttribute("src", "../pix/wait.gif");
		$("msg").innerHTML = "Problem fetching data" + "<br \\>" + "(will retry again later)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd === "hang") {
		/* indicate some error
		   has occured */

        $("indicator").setAttribute("src", "../pix/wait.gif");
		$("msg").innerHTML = "Possible network error" + "<br \\>" + "(will retry again later)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
    
	if (cmd === "e101") {
		/* indicate some error
		   has occured */
		  
        $("indicator").setAttribute("src", "../pix/wait.gif");
        $("msg").innerHTML = "Unexpected error #1" + "<br \\>" + "(will retry in 5 minutes)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
    
	if (cmd === "e102") {
		/* indicate some error
		   has occured */
		  
        $("indicator").setAttribute("src", "../pix/wait.gif");
        $("msg").innerHTML = "Unexpected error #2" + "<br \\>" + "(will retry in 5 minutes)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
    
	if (cmd === "e103") {
		/* indicate some error
		   has occured */
		  
        $("indicator").setAttribute("src", "../pix/wait.gif");
        $("msg").innerHTML = "Unexpected error #3" + "<br \\>" + "(will retry in 5 minutes)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
    
	if (cmd === "e104") {
		/* indicate some error
		   has occured */
		  
        $("indicator").setAttribute("src", "../pix/wait.gif");
        $("msg").innerHTML = "Unexpected error #4" + "<br \\>" + "(will retry in 5 minutes)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
    
	if (cmd === "e105") {
		/* indicate some error
		   has occured */
		  
        $("indicator").setAttribute("src", "../pix/wait.gif");
        $("msg").innerHTML = "Unexpected error #5" + "<br \\>" + "(will retry in 5 minutes)";
		
		clearInterval(slider);
		hide("data");
		show("wait");
		
		return;
	}
}

function extract() {
/*  Extract and format the raw 
    data for our use. */
	   
	var earnings,
        now,
        y,
        tm,
        lm,
        dComp,
        mComp,
        tue,
        te,
        eto,
        emo,
        etu,
        edaily,
        emonthly,
        etotal,
        arc,
        slideshow,
        convert,
        temp,
        div;
	
    out = [];
	
	edaily = parseInt(widget.preferences.edaily, 10);
	emonthly = parseInt(widget.preferences.emonthly, 10);
	etotal = parseInt(widget.preferences.etotal, 10);
	
	slideshow = parseInt(widget.preferences.slideshow, 10);
	convert = parseInt(widget.preferences.convert, 10);
    arc = widget.preferences.arc;
    
    earnings = data.earnings;
	
	if (earnings) {
		refDial('wait');
			
		if (edaily) {
            /* Daily earnings data */
                
            now = earnings[0][2];
			y = earnings[1][2];

			/* check if earning data is more or
			   less than previous day's earning */
			if ((parseFloat(now.substr(1))) <= (parseFloat(y.substr(1)))) {
				dComp = "down";
			} else {
				dComp = "up";
			}
				
			if (convert) {
				now = now.trim();
				y = y.trim();
                
                
                // remove currency symbol
                
                switch (arc) {
                case "USD":
                    now = now.substring(now.indexOf('$') + 1);
                    y = y.substring(y.indexOf('$') + 1);
                    now = now.trim();
                    y = y.trim();
                    break;
                        
                case "GBP":
                    now = now.substring(now.indexOf('£') + 1);
                    y = y.substring(y.indexOf('£') + 1);
                    now = now.trim();
                    y = y.trim();
                    break;
                        
                case "AUD":
                    now = now.substring(now.indexOf('$') + 1);
                    y = y.substring(y.indexOf('$') + 1);
                    now = now.trim();
                    y = y.trim();
                    break;
                        
                case "EUR":
                    now = now.substring(now.indexOf('€') + 1);
                    y = y.substring(y.indexOf('€') + 1);
                    now = now.trim();
                    y = y.trim();
                    break;
                }
					
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
            /* Monthly earnings data */

			tm = earnings[2][2];
			lm = earnings[3][2];
		  
            /* check if earning data is more or
			   less than previous month's earning */
			
            if ((parseFloat(tm.substr(1))) <= (parseFloat(lm.substr(1)))) {
				mComp = "down";
			} else {
				mComp = "up";
			}
			
			if (convert) {
				tm = tm.trim();
				lm = lm.trim();
				
				// remove dollar / euro symbol
                
                switch (arc) {
                case "USD":
                    tm = tm.substring(tm.indexOf('$') + 1);
                    lm = lm.substring(lm.indexOf('$') + 1);
                    tm = tm.trim();
                    lm = lm.trim();
                    break;
                        
                case "GBP":
                    tm = tm.substring(tm.indexOf('£') + 1);
                    lm = lm.substring(lm.indexOf('£') + 1);
                    tm = tm.trim();
                    lm = lm.trim();
                    break;
                        
                case "AUD":
                    tm = tm.substring(tm.indexOf('$') + 1);
                    lm = lm.substring(lm.indexOf('$') + 1);
                    tm = tm.trim();
                    lm = lm.trim();
                    break;
                        
                case "EUR":
                    tm = tm.substring(tm.indexOf('€') + 1);
                    lm = lm.substring(lm.indexOf('€') + 1);
                    tm = tm.trim();
                    lm = lm.trim();
                    break;
                }
				
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
        
        if (etotal) {
		/* total unpaid earnings */
            
            te = total;
            
            if (convert) {
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
	
	return;
}

function converter(file, arc, luc) {
	/* Currency conversion */
	
    var csv,
        rates;
    
	csv = file.split(/\r?\n/);
	
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

function authenticate(input) {
/*  checks if user is logged in
    and returns True or False */
    
    var allowed,
        stat,
        gcode,
        div,
        login;
    
    allowed = false;
    
	if (input) {
	/*  parse the scraped page we got from Google */
		
		/* extract <body> element kids from scraped page */
		gcode = input.substring(input.indexOf("<body>") + 7, input.indexOf("</body>"));

		/* We extract data based on the id's. 
		   To do this efficiently, we use
		   querySelector(), which works on DOM, 
		   elements and document fragments. So we
		   create an element, append the elements 
		   from the scraped page and search for
		   known ids using querySelector(). */
		   
		div = e('div');
        
        /* Note: innerHTML doesn't execute any 
           JS code. */
		div.innerHTML = gcode;
        
        /*  if selectors specified are invalid,
            a syntax error will be thrown. */
            
        try {
            /* the login form has an id called 'gaia_loginform' */
		    login = div.querySelector("#gaia_loginform");
        } catch (g) {
            login = null;
        }
        
        /*  if selector isn't found
            login will be null */
        
        if (login) {
            /* login form found */
            allowed = false;
        } else {
            allowed = true;
        }
    }
    return allowed;
}

function getRates() {
	/* Get currency rate from Yahoo! */
	
	var csvfile,
        query,
        url,
        arc,
        luc,
        ext;
    
    refDial('wait');
	
    url = 'http://download.finance.yahoo.com/d/quotes.csv?f=sl1&e=.cs&s=';
	
	arc = widget.preferences.arc;
	luc = widget.preferences.luc;
    
    switch (arc) {
    case 'USD':
        query = arc + luc + '=X';
        break;
    	
	case 'EUR':
		query = 'USDEUR=X&s=USD' + luc + '=X';
        break;
	 
	case 'GBP':
		query = 'USDGBP=X&s=USD' + luc + '=X';
        break;
    
	case 'AUD':
		query = 'USDAUD=X&s=USD' + luc + '=X';
        break;
	}
	
	url = url + query;
	
	ext = new XMLHttpRequest();

	ext.open('GET', url, true);
	
	ext.onreadystatechange = function (event) {
		if (this.readyState === 4) {
			if (this.status === 200 && this.responseText) {
				csvfile = this.responseText;
				converter(csvfile, arc, luc);
                extract();
			} else {
				/*  problem fetching data; retry 
                    after 1 minute */

                refDial('nodata');
                setRefreshTimer(1);
			}
		}
	};

    try {
        ext.send();
    } catch (e) {
        /*  possible network error -
            tell the user. */
        
        refDial("hang");
        
        /* reset refresh timer to check every  
           30 seconds if network is up */
        setRefreshTimer(0.5);
    }
    
	return;
}

function getTotal() {
/*  To get total unpaid
    finalised earnings. */

    var today,
        month,
        convert,
        url,
        xhr,
        params,
        id;
    
	refDial('wait');
    
    today = new Date();
    month = parseInt(widget.preferences.month, 10);
    convert = parseInt(widget.preferences.convert, 10);
    
    /*  Be nice to Google.
        Total unpaid earnings is updated
        only monthly. So once we have it, 
        do monthly updates only for it. */
    
    /*  We need to get the total from
        Adsense, if -
        (1) 'month' preference is default 
             value 13 OR
        (2) we have last month's total. */
    
    if ((today.getMonth() > month) || (month === 13)) {
        
        /* error detection - check data */
        try {
            id = data.accounts[0].id;
        } catch (f) {
            /*  problem fetching data; retry 
                after 1 minute */
    
            refDial('nodata');
            setRefreshTimer(1);
        }
        
        /*  error detection - check id
            is not undefined */
        
        if (id) {
            params = "csv=true&historical=false&reportRange=ALL_TIME&pid=" + id.trim();
        } else {
            /*  problem fetching data; retry 
                after 1 minute */
    
            refDial('nodata');
            setRefreshTimer(1);
        }
        
        url = "https://www.google.com/adsense/reports-payment?" + params;
        
        xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        
        xhr.onload = function (event) {
            var tsv,
                temp,
                convert;
            
            if (this.status === 200) {
                tsv = this.responseText;
                if (authenticate(tsv)) {
                    
                    /* lazy parsing */
                    temp = tsv.split("\t");
                    total = temp[temp.length - 1].trim();
                    
                    /*  error detection - total
                        should be a number */
                    if (parseFloat(total, 10)) {
                        
                        widget.preferences.total = total;
                        widget.preferences.month = String(today.getMonth());
                        
                        convert = parseInt(widget.preferences.convert, 10);
                    
                        if (convert) {
                            getRates();
                        } else {
                            extract();
                        }
                    } else {
                        /*  problem fetching data; retry 
                            after 1 minute */
            
                        refDial('nodata');
                        setRefreshTimer(1);
                    }
                } else {
                    /*  inform user to login - check
                        again every 2 minutes */
                    
                    refDial('login');
                    setRefreshTimer(2);
                }
            } else {
                /*  problem fetching data; retry 
                    after 1 minute */
    
                refDial('nodata');
                setRefreshTimer(1);
            }
        };
        
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        
        try {
            xhr.send();
        } catch (e) {
            /*  possible network error -
                tell the user. */
            
            refDial("hang");
            
            /* reset refresh timer to check every  
               30 seconds if network is up */
            setRefreshTimer(0.5);
        }
    } else {
        /* reuse saved value */
        total = widget.preferences.total;
        
        if (convert) {
            getRates();
        } else {
            extract();
        }
        return;
    }
}
 
function getRaw(input) {
/* Calls an interface that returns
   an invalid JSON that has the daily
   and monthly earnings data we seek. */
    
    var lfedata,
        url,
        xhr,
        onLoad;
    
    lfedata = input.substring(input.indexOf("ads.adsense.lightfe.main.init") + 31, input.indexOf("ads.adsense.lightfe.home.loadData"));
    
    lfedata = lfedata.split(",");
    
    /* error check lfedata  */
    if (lfedata.length === 1) {
        /*  Unexpected Error #2 - inform
            user and retry after 5 minutes */
		refDial('e102');
        setRefreshTimer(5);
        return;
    }
    
    lfedata[0] = lfedata[0].trim();
    lfedata[1] = lfedata[1].trim();
    lfedata[0] = lfedata[0].substring(lfedata[0].indexOf("\'") + 1, lfedata[0].lastIndexOf("\'"));
    lfedata[1] = lfedata[1].substring(lfedata[1].indexOf("\'") + 1, lfedata[1].lastIndexOf("\'"));
    
    url = "https://www.google.com/adsense/m/data/home?hl=" + lfedata[0];
    xhr = new XMLHttpRequest();
    
    onLoad = function (e) {
        if (e.target.status === 200) {
            data = e.target.responseText;
            
            /* sample raw data - 
            )]}'{"top_channels": [["channel-name", "$0.42"], ["channel-name", "$0.14"], ["channel-name", "$0.12"], ["channel-name", "$0.04"]], "accounts": [{"kind": "adsense#account", "premium": false, "id": "pub-01234567890123456", "name": "pub-01234567890123456"}], "earnings": [["Today so far", "-", "$0.25"], ["Yesterday", "Mon March 17, 2014", "$5.14"], ["This month so far", "March", "$30.64"], ["Last month", "February", "$28.59"]]} 
            */
            
            // get valid JSON data from raw data
            data = data.substring(data.indexOf("{"), data.length);
            
            try {
                data = JSON.parse(data);
            } catch (f) {
                /*  Unexpected Error #3 - inform
                    user and retry after 5 minutes */
                refDial('e103');
                setRefreshTimer(5);
                return;
            }
            
            /*  5 seconds delay to make
                Google happy */
            
            setTimeout(getTotal, 5 * 1000);
            
        } else {
            /*  problem fetching data; retry 
                after 1 minute */

            refDial('nodata');
            setRefreshTimer(1);
        }
    };
    
    xhr.open('POST', url, true);
    xhr.onload = onLoad;
    xhr.withCredentials = true;
    
    xhr.setRequestHeader("Referer", "https://www.google.com/adsense/m/");
    xhr.setRequestHeader("X-Lightfe-Auth", "1");
    xhr.setRequestHeader("Client-Version", lfedata[1]);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
    
    try {
        xhr.send();
    } catch (e) {
        /*  possible network error -
            tell the user. */
        
        refDial("hang");
        
        /* reset refresh timer to check every  
           30 seconds if network is up */
        setRefreshTimer(0.5);
    }
}

function getPage() {
/* Scrape the mobile version of 
    Google Adsense Control Panel. */

    var url,
        ext;
    
	url = "https://www.google.com/adsense/m/";
	
	refDial('wait');
	
    ext = new XMLHttpRequest();
	ext.open('GET', url, true);
    
	ext.onreadystatechange = function (event) {
        var page;
        if (this.readyState === 4) {
            if (this.status === 200 && this.responseText) {
                page = this.responseText;
                if (authenticate(page)) {
                    
                    /*  5 seconds delay to make
                        Google happy */
                    setTimeout(getRaw, 5 * 1000, page);
                } else {
                    /* inform user to login */
                    refDial('login');
                    
                    /* reset refresh timer to check every  
                       2 minute if user has logged in */
                    setRefreshTimer(2);
                }
            } else {
				/*  problem fetching data; retry 
                    after 1 minute */
                
				refDial('nodata');
                setRefreshTimer(1);
            }
        }
	};
    
    try {
        ext.send();
    } catch (e) {
        /*  possible network error -
            tell the user. */

        refDial("hang");
        
        /* reset refresh timer to check every  
           30 seconds if network is up */
        setRefreshTimer(0.5);
    }
}

function setDisplayTimer() {
	clearInterval(slider);
	slider = setInterval(startSlide, parseInt((widget.preferences.showfor), 10) * 1000);
}

function reconfigure(e) {
/* Update the speed dial to reflect the
    changes made in options by the user. */
	
	if (e.storageArea !== widget.preferences) { return; }
	switch (e.key) {
    case 'interval':
        setRefreshTimer(parseInt((widget.preferences.interval), 10));
        break;
    case 'showfor':
        setDisplayTimer();
        break;
	case 'edaily':
        extract();
        break;
	case 'emonthly':
        extract();
        break;
	case 'etotal':
        extract();
        break;
	case 'slideshow':
        extract();
        break;
	}
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