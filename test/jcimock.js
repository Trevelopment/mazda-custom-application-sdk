/**
 * JCI Mock Environment
 * Simplifies local development
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-enhanced-compass)
 * Copyright (c) 2015. All rights reserved.
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
 */

// (log)
var log = {

	addSrcFile: function() {},

	debug: function() {
		console.log(arguments);
	},


};


// (framework)
var framework = {

	init: function() {

		this.root = document.getElementById("mock");

		this.view = document.getElementById("view");

		this.surface = document.getElementById("surface");

		this.menu = $(document.getElementById("menu"));

		this.createMenu();

	},

	createMenu: function() {


		CustomApplicationsHandler.retrieve(function(items) {



			this.menu.html("");

            items.forEach(function(item) {

            	this.menu.append($("<a/>").attr("appId", item.appData.appId).click(this.execMenu).append(item.title));

                //this._masterApplicationDataList.items.push(item);

            }.bind(this));

        }.bind(this));

	},

	execMenu: function() {

		var id = $(this).attr("appId");

		CustomApplicationsHandler.run(id);

	},

	ready: function(callback) {
		
	},

	common: {

		statusBar: {

			clock: {

				innerHTML: false,

				_update: function() {
					 var today = new Date(), h = today.getHours(), m = today.getMinutes();


					 var s = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;

					 document.getElementById("clock").innerHTML = s;

					 return s;

				},
			}

		},

	},

	loadControl: function(appId, controlId, controlName) {

		// initialize
		var controlName = controlName || (controlId + 'Ctrl'),
			path = "apps/" + appId +"/controls/" + controlId + '/';

		// create resources
		this.loadCSS(path + 'css/' + controlName + '.css');
		this.loadJS(path + 'js/' + controlName + '.js');

	},

	loadCSS: function(filename, callback) {
		var css = document.createElement('link');
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = filename;
        css.onload = callback;
        document.body.appendChild(css);
	},

	loadJS: function(filename, callback) {
		var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = filename;
        script.onload = callback;
        document.body.appendChild(script);
	},


	/** 
	 * Mocks
	 */

	registerAppLoaded: function() {},

	registerTmpltLoaded: function() {},

	routeMmuiMsg: function(data) {

		if(data.msgType == "focusStack") {

			// initialize template
			var template = new CustomApplicationSurfaceTmplt("system", this.surface, 1);


		}
	},

};

// (interval)
setInterval(function() {

	framework.common.statusBar.clock._update();

}, 500);


