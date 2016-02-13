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
		framework: 'apps/system/custom/runtime/',
		applications: 'apps/system/custom/apps/', 
		library: 'apps/system/custom/runtime/library/'
	},

	/**
	 * (Mapping)
	 */

	mapping: {


	},

	/**
	 * (initialize) Initializes some of the core objects
	 */

	initialize: function() {

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
								CustomApplicationResourceLoader.fromFormatted("{0}/app.js", CustomApplications),
								this.paths.applications,
								function() {
									// all applications are loaded, run data
									CustomApplicationDataHandler.initialize();

									// create menu items
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

		application.location = this.paths.applications + id + "/";

		application.__initialize();

		this.applications[id] = application;
		
		return true;
	},

	/**
	 * (run) runs an application
	 */

	run: function(id) {

		CustomApplicationLog.info(this.__name, "Run request for application", {id: id});		

		if(CustomApplicationHelpers.is().object(id)) {

			id = id.appId ? id.appId : false;
		}

		if(this.applications[id]) {

			this.currentApplicationId = id;

			CustomApplicationLog.info(this.__name, "Preparing application launch", {id: id});

			if(typeof(framework) != "undefined") {

				var list = framework._focusStack;

				list.unshift({id: "system"});

				// send message to framework to launch application
				framework.routeMmuiMsg({"msgType":"transition","enabled":true});
				framework.routeMmuiMsg({"msgType":"ctxtChg","ctxtId":"CustomApplicationSurface","uiaId":"system","contextSeq":2})
				framework.routeMmuiMsg({"msgType":"focusStack","appIdList": list});
				framework.routeMmuiMsg({"msgType":"transition","enabled":false});

				return true;

			}

			CustomApplicationLog.error(this.__name, "Failed to launch application because framework is not available", {id: id});

			return false;
		
		}

		CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});

		return false;
	},

	/**
	 * (sleep) sleeps an application
	 */

	sleep: function(application) {

		if(application.id == this.currentApplicationId) {
			this.currentApplicationId = false;
		}

		application.__sleep();
	},


	/**
	 * (getCurrentApplication) returns the current application
	 */

	getCurrentApplication: function() {

		if(this.currentApplicationId) {

			CustomApplicationLog.debug(this.__name, "Invoking current set application", {id: this.currentApplicationId});

			if(this.applications[this.currentApplicationId]) {

				return this.applications[this.currentApplicationId];
			}

			CustomApplicationLog.error(this.__name, "Application was not registered", {id: this.currentApplicationId});

			return false;
		}


		CustomApplicationLog.error(this.__name, "Missing currentApplicationId");

		return false;
	},

	/**
	 * (notifyDataChange) notifies the active application about a data change
	 */

	notifyDataChange: function(id, payload) {

		if(this.currentApplicationId && this.applications[this.currentApplicationId]) {

			this.applications[this.currentApplicationId].__notify(id, payload);

		}

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
					appName : 'custom_' + application.getId(), 
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

};
