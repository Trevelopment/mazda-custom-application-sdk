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
 * (CustomApplicationsHandler)
 *
 * This is the custom handler that manages the application between the JCI system and the mini framewor
 */

var CustomApplicationsHandler = {

	__name: 'ApplicationsHandler',

	/**
	 * (Applications) storage for applications
	 */

	applications: {},

	/**
	 * (Paths)
	 */

	paths: {
		framework: 'apps/system/custom/framework/',
		applications: 'apps/system/custom/apps/', 
		library: 'apps/system/custom/library/',
	},

	/**
	 * (initialize) Initializes some of the core objects
	 */

	initialize: function() {

		this.multicontroller = typeof(Multicontroller) != "undefined" ? new Multicontroller(this.handleControllerEvent) : false;

		this.initialized = true;
	},


	/**
	 * (Retrieve) loads the current application list and returns the additional items
	 */

	retrieve: function(callback) {

		try {
			// initialize
			if(!this.initialized) this.initialize();

			// load libraries

			CustomApplicationResourceLoader.loadJavascript("jquery.js", this.paths.library, function() {

				CustomApplicationResourceLoader.loadCSS("bootstrap.css", this.paths.framework, function() {

					CustomApplicationResourceLoader.loadJavascript("apps.js", this.paths.applications, function() {

						// this has been completed
						if(typeof(CustomApplications) != "undefined") {

							// load applications
							CustomApplicationResourceLoader.loadJavascript(
								CustomApplicationResourceLoader.fromFormatted("{0}/application.js", CustomApplications),
								this.paths.applications,
								function() {
									callback(this.getMenuItems());
								}.bind(this)
							);
						}

					}.bind(this));

				}.bind(this)); // bootstrap css

			}.bind(this)); // jquery library

		} catch(e) {

			// error message
			CustomApplicationLog.error(this.__name, "Error while retrieving applications", e);

			// make sure that we notify otherwise we don't get any applications
			callback(this.getMenuItems());
		}
	},

	/**
	 * (Register) registers all the custom applications
	 */

	register: function(id, application) {

		CustomApplicationLog.info(this.__name, {id:id}, "Registering application");

		application.id = id;

		this.applications[id] = application;
		
		return true;
	},

	/**
	 * (run) runs an application
	 */

	run: function(id) {
		return this.wakeup(id);
	},


	/**
	 * (wakeup) shows the applicaton with the id
	 */

	wakeup: function(id) {

		this.sleep(this.currentApplicationId);

		if(this.invoke(id, "__wakeup")) {

			this.currentApplicationId = id;
		}	
	},

	/**
	 * (sleep) hides the application with the id
	 */

	sleep: function(id) {

		if(this.invoke(id, "__sleep")) {
		
			if(this.currentApplicationId == id) {
				this.currentApplicationId = false;
			}
		}
	},

	/**
	 * (termimate) destroys the application
	 */

	terminate: function(id) {

		this.sleep(id);

		this.invoke(id, "__terminate");
	},

	/**
	 * (invoke) application lifetime handler
	 */

	invoke: function(id, method) {

		if(!id) return false;

		CustomApplicationLog.debug(this.__name, "Invoke application operation", {id: id, method: method});

		if(id && this.applications[id] && CustomApplicationHelpers.is().fn(this.applications[id][method])) {

			this.applications[id][method]();

			return true;
		} 

		CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});

		return false;
	},

	/**
	 * (getMenuItems) returns the items for the main application menu
	 */

	getMenuItems: function(callback) {

		return CustomApplicationHelpers.iterate(this.applications, function(id, application) {

			CustomApplicationLog.info(this.__name, {id:id}, "Adding application to menu", {
				title: application.getTitle(),
			});

			return {
				appData : { 
					appName : application.getTitle(), 
					isVisible : true, 
					mmuiEvent : 'ExecuteCustomApplication',
					appId: application.getId(),         
				}, 
				title: application.getTitle(),
				text1Id : application.getTitle(),
				disabled : false,  
				itemStyle : 'style01', 
				hasCaret : false 
			};

		}.bind(this));
	},


	/**
	 * MultiController Handler
	 */

	handleControllerEvent: function(eventId) {

        var response = "ignored"; // consumed

	    CustomApplicationLog.debug(this.__name, "Controller event received", {event: eventId});

        if(this.currentApplicationId && this.applications[this.currentApplicationId]) {

  			if(this.applications[this.currentApplicationId].handleControllerEvent(eventId)) {

  				response = "handled";

  			}
        }

        /*

        switch(eventId) {
            case "select":
            case "left":
            case "right":
            case "down":
            case "up":
            case "cw":
            case "ccw":
            case "lostFocus":
    		case "acceptFocusInit":
	        case "leftStart":
    		case "left":
 		    case "rightStart":
    		case "right":
    		case "selectStart":
        };*/
        
        return response;
    },


};

//{ appData : { appName : 'hdtrafficimage', isVisible : false, mmuiEvent : 'SelectHDTrafficImage'         }, text1Id : 'HDTrafficItem',               disabled : true,  itemStyle : 'style01', hasCaret : false },

