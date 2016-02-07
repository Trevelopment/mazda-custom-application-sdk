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
	},


	/**
	 * (Retrieve) loads the current application list and returns the additional items
	 */

	retrieve: function(callback) {

		try {
			CustomApplicationResourceLoader.loadCSS("bootstrap.css", this.paths.framework);

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

		} catch(e) {
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
	 * (Show) shows the applicaton with the id
	 */

	show: function(id) {

		if(!id) return false;

		this.hide(this.currentApplicationId);

		CustomApplicationLog.debug(this.__name, "Request to show application", {id: id});

		if(this.applications[id]) {	

			this.currentApplicationId = id;

			this.applications[id].wakeup();

		} else {
			CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});
		}

	},

	/**
	 * (Hide) hides the application with the id
	 */

	hide: function(id) {

		if(!id) return false;

		CustomApplicationLog.debug(this.__name, "Request to hide application", {id: id});

		if(this.applications[id]) {	

			this.applications[id].sleep();

			if(this.currentApplicationId == id) {
				this.currentApplicationId = false;
			}

		} else {
			CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});
		}
	},

	/**
	 * (Destroy) destroys the application
	 */

	destroy: function(id) {

		if(!id) return false;

		CustomApplicationLog.debug(this.__name, "Request to destroy application", {id: id});

		if(this.applications[id]) {	

			this.applications[id].terminate();

			if(this.currentApplicationId == id) {
				this.currentApplicationId = false;
			}

		} else {
			CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});
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

};

//{ appData : { appName : 'hdtrafficimage', isVisible : false, mmuiEvent : 'SelectHDTrafficImage'         }, text1Id : 'HDTrafficItem',               disabled : true,  itemStyle : 'style01', hasCaret : false },

