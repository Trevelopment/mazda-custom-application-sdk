/**
 * Custom Applications SDK for Mazda Connect Infotainment System
 * 
 * A mini framework that allows to write custom applications for the Mazda Connect Infotainment System
 * that includes an easy to use abstraction layer to the JCI system.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-applications-sdk)
 * Copyright (c) 2016. All rights reserved.
 * 
 * WARNING: The installation of this application requires modifications to your Mazda Connect system.
 * If you don't feel comfortable performing these changes, please do not attempt to install this. You might
 * be ending up with an unusuable system that requires reset by your Dealer. You were warned!
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the 
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with this program. 
 * If not, see http://www.gnu.org/licenses/
 *
 */

/**
 * (Helpers)
 *
 */

(function() {

	/**
	 * (is) a implemention of the flyandi:is library
	 */

	Is = {

		undefined: 'undefined',

		__toString: function() {
			return Object.prototype.toString.call(arguments[0]);
		},

		/** (iterable) */
		iterable: function() {
			return this.object(arguments[0]) || this.array(arguments[0]);
		},

		/** (fn) */
		fn: function() {
			return typeof(arguments[0]) == "function";
		},

		/** (object) */
		object: function() {
			return typeof(arguments[0]) == "object";
		},

		/** (array) */
		array: function() {
			return this.__toString(arguments[0]) === '[object Array]';
		},

		/** (date) */
		date: function() {
			return this.__toString(arguments[0])  === '[object Date]';
		},

		/** (string) */
		string: function() {
			return typeof(arguments[0]) == "string";
		},

		/** (number) */
		number: function() {
			return typeof(arguments[0]) == "number";
		},

		/** (boolean) */
		boolean: function() {
			return typeof(arguments[0]) == "boolean";
		},

		/** (defined) */
		defined: function() {
			return typeof(arguments[0]) != Is.undefined;
		},

		/** (element) */
		element: function() {
			return typeof(HTMLElement) !== Is.undefined ? (arguments[0] instanceof HTMLElement) : (arguments[0] && arguments[0].nodeType === 1);
		},

		/** (empty) */
		empty: function(o) {
			switch(true) {
				case this.array(o) || this.string(o): 
					return o.length === 0; 

				case this.object(o): 
					var s = 0;
					for(var key in o) 
						if(o.hasOwnProperty(key)) s++;
					return s === 0;
			
				case this.boolean(o):
					return o === false;

				default:
					return !o;
			}
		},

		/** (same) */
		same: function(a, b) {
			return a == b;
		},
	};

	/**
	 * sprintr
	 */

	sprintr = function() {
		var 
			args = Array.prototype.slice.call(arguments),
			subject = arguments[0];

		args.shift();

		for(var i = 0; i < args.length; i++) 
			subject = subject.split("{" + i + "}").join(args[i]);

		return subject;
	};

	/**
	 * Date
	 */

	Date.replaceChars = {
		shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		longMonths: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		shortDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
		longDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],


		// Day
		d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
		D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
		j: function() { return this.getDate(); },
		l: function() { return Date.replaceChars.longDays[this.getDay()]; },
		N: function() { return this.getDay() + 1; },
		S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
		w: function() { return this.getDay(); },
		z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
		// Week
		W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
		// Month
		F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
		m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
		M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
		n: function() { return this.getMonth() + 1; },
		t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
		// Year
		L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },       // Fixed now
		o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
		Y: function() { return this.getFullYear(); },
		y: function() { return ('' + this.getFullYear()).substr(2); },
		// Time
		a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
		A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
		B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
		g: function() { return this.getHours() % 12 || 12; },
		G: function() { return this.getHours(); },
		h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
		H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
		i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
		s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
		u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
		'0' : '')) + m; },
		// Timezone
		e: function() { return "Not Yet Supported"; },
		I: function() { return "Not Yet Supported"; },
		O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
		P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
		T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
		Z: function() { return -this.getTimezoneOffset() * 60; },
		// Full Date/Time
		c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
		r: function() { return this.toString(); },
		U: function() { return this.getTime() / 1000; }
	};

	/** (date.format) extends the date prototype with format */
	Date.prototype.format = function(format) {
		// initialize result
		var result = "";
		// initialize
		var replace = Date.replaceChars;
		// cycle
		for (var i = 0; i < format.length; i++) {
			// initialize 
			var curChar = format.charAt(i);     
			// sanity check
			if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
				result += curChar;
			} else if (replace[curChar]) {
				result += replace[curChar].call(this);
			} else if (curChar != "\\"){
				result += curChar;
			}
		}
		// return result
		return result;
	};

	/**
	 * (fromUnix)
	 */

	Date.prototype.fromUnix = function(u) {
		this.setTime(parseInt(u * 1000));  

		return this;	/** chainable */
	};

}.call(this));
