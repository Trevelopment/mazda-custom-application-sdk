/**
 * Enhanced Applications for Mazda Connect Infotainment
 * 
 * A helper to bring custom applications into the Mazda Connect Infotainment System without
 * writing custom on screen functionality.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-enhanced-applications)
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

var CustomApplicationsHandler = {

	/**
	 * (Items) storage for new items
	 */

	items: [],

	/**
	 * (Retrieve) loads the current application list and returns the additional items
	 */

	retrieve: function(callback) {

		try {
			 utility.loadScript("apps/system/custom/apps/apps.js", null, function() {

			 	// this has been completed
			 	if(typeof(CustomApplications) != "undefined") {

			 		this.register(CustomApplications);

			 		if(typeof(callback) == "function") {
			 			callback(this.items);
			 		}
			 	}

			 }.bind(this));
		} catch(e) {
			// make sure that we notify otherwise we don't get any applications
			callback(this.items);
		}
	},

	/**
	 * (Register) registers all the custom applications
	 */

	register: function(applications) {

		applications.forEach(function(application) {


			this.items.push({
				appData : { 
					appName : application.getName(), 
					isVisible : true, 
					mmuiEvent : 'ExecuteCustomApplication'         
				}, 
				text1Id : application.getName()
				disabled : false,  
				itemStyle : 'style01', 
				hasCaret : false 
			});

		}.bind(this));

	}


};

//{ appData : { appName : 'hdtrafficimage', isVisible : false, mmuiEvent : 'SelectHDTrafficImage'         }, text1Id : 'HDTrafficItem',               disabled : true,  itemStyle : 'style01', hasCaret : false },
        