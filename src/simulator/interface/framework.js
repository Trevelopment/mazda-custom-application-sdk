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
 * JCI Mock Objects
 */


/**
 * (log) log file
 */

var log = {

	addSrcFile: function() {},

	debug: function() {

		//console.log(arguments);
	},


};


/**
 * (CustomApplicationsProxy) Mock - yeah I know :-)
 */

var CustomApplicationsProxy = {
	invokeApplication: function() {
		framework.sendEventToMmui();
		return true;
	}
};

/**
 * (framework)
 */

var framework = {

	current: false,

	/**
	 * (ready)
	 */

	ready: function(callback) {

		setInterval(function() {

			framework.common.statusBar.clock._update();
		}, 950);

	},

	/**
	 * (mock) common
	 *
	 * This mocks the common object of the JCI system
	 */

	common: {

		statusBar: {

			setAppName: function(title) {

				$("#title").html(title);

			},

			setDomainIcon: function(icon) {

				if(icon) {
					$("#domain").css({"background-image": "url(" + icon + ")"}).show();
				} else {
					$("#domain").hide();
				}

			},

			showHomeBtn: function(show) {
				if(show) {
					$("#home").show();
				} else {
					$("#home").hide();
				}
			},

			clock: {

				innerHTML: false,

				_update: function() {
					 var today = new Date(), h = today.getHours(), m = today.getMinutes();


					 var s = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;

					 $("#clock").html(s);

					 return s;

				},
			}

		},

	},

	/**
	 * (loaders)
	 */

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

	sendEventToMmui: function(uaId, event) {

		// clean up
		this.cleanup();

		// initialize template
		this.current = new SurfaceTmplt("system", Interface.surface.get(0), 1);

		// check
		if(this.current.properties) {

			switch(true) {

				case this.current.properties.leftButtonVisible:
					Interface.statusBar.fadeIn();
					Interface.leftButton.fadeIn();
					Interface.view.addClass("statusbar leftbutton");
					break;

				case this.current.properties.statusBarVisible:
					Interface.statusBar.fadeIn();
					Interface.leftButton.fadeOut();
					Interface.view.addClass("statusbar").removeClass("leftbutton");
					break;

				default:
					Interface.statusBar.fadeOut();
					Interface.view.removeClass("statusbar leftbutton");
					break;

			}
		}

		Interface.view.fadeIn();

	},

	/**
	 * Cleanup
	 */

	cleanup: function() {
		if(this.current) {
			this.current.cleanUp();
			Interface.surface.empty();
			this.current = false;
		}
	},

};