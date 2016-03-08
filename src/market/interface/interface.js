/**
 * Custom Applications SDK for Mazda Connect Infotainment System
 *
 * A mini framework that allows to write custom applications for the Mazda Connect Infotainment System
 * that includes an easy to use abstraction layer to the JCI system.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-application-sdk)
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
 * NPM/Node Integration
 */
var fs = require("fs");



/**
 * Interface
 *
 * This is really messy code but it does the job - so don't judge me here! :-)
 *
 */


(function() {

	Interface = {

		/**
		 * Privates
		 */


		/**
		 * (initialize)
		 *
		 * Initializes the interface and simulator
		 */

		initialize: function() {

			// basics
			this.sidebar = $("#sidebar");

			this.main = $("#main");

			// setup menu items
			this.setupSideBar();
		},


		/**
		 * (setupSideBar)
		 * @param void
		 */
		
		setupSideBar: function() {

			this.sidebar.on("click", "label", function() {

				Interface.sidebar.find("[selected]").removeAttr("selected");

				$(this).attr("selected", "selected");

				var nextPanel = $(this).attr("panel"),
					activePanel = Interface.main.find("panel[active]"),

					showNextPanel = function() {

						$("panel[name=" + nextPanel + "]").attr("active", "active").animate({
							left:300,
							opacity:1
						}, 300);
					};

				if(activePanel.length) {

					activePanel.removeAttr("active").animate({
						left: -1 * 300,
						opacity:0,
					}, 300, function() {
						showNextPanel();
					});

				} else {
					showNextPanel();
				}

			});

		}
	}



	/**
	 * Intialize Interface after jQuery is loaded
	 */

	$(function() {
		Interface.initialize();
	});

}).call(this);


