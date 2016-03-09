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

		__panelPath: [],


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

			// setup buttons
			this.setupButtons();
		},

		/**
		 * (setupButtons)
		 */

		setupButtons: function() {

			$("button[action]").on("click", function() {

				var action = $(this).attr("action");

				if(Interface[action]) {
					Interface[action]();
				}

			});

		},

		/**
		 * (setupSideBar)
		 * @param void
		 */

		setupSideBar: function() {

			this.sidebar.on("click", "label", function() {

				// highlight
				Interface.sidebar.find("[selected]").removeAttr("selected");

				$(this).attr("selected", "selected");

				var call = $(this).attr('call') || false,
					panel = $(this).attr('panel') || false;

				// process
				switch(true) {

					/**
					 * call
					 * @type string
					 */
					case call !== false:

						if(Interface[call]) {
							return Interface[call]();
						}
						break;

					/**
					 * panel
					 * @type string
					 */
					case panel !== false:

						Interface.__panelPath = [];

						Interface.showPanel(panel);
						break;

					default:

						console.error("sideBar: no valid item");
						break;
				}


			});
		},


		/**
		 * disableSidebar
		 */

		disableSidebar: function() {
			if(!this.sidebarDisabled) {
				this.sidebarDisabled = true;
				$("#menudisabler").fadeIn();
			}
		},

		/**
		 * enableSidebar
		 */

		enableSidebar: function() {
			if(this.sidebarDisabled) {
				this.sidebarDisabled = false;
				$("#menudisabler").fadeOut();
			}
		},


		/**
		 * showPanel
		 */

		showPanel: function(nextPanel, methodCallback, panelCallback) {

			var activePanel = Interface.main.find("panel[active]"),

				prepareNextPanel = function() {

					var panel = $("panel[name=" + nextPanel + "]"),
						on = panel.attr("on") || false,

						next = function() {

							Interface.__panelPath.push(panel.attr("name"));

							panel.attr("active", "active").animate({
								left:300,
								opacity:1
							}, 300, function() {

								var at = panel.attr("at") || false;

								if(at !== false && Interface[at]) {
									Interface[at](panel);
								}

								if(panelCallback) {
									panelCallback(panel);
								}

							});
						}

					if(on !== false && Interface[on]) {
						return Interface[on](next, panel, methodCallback);
					}

					return next();
				};

			if(activePanel.length) {

				activePanel.removeAttr("active").animate({
					left: -1 * 300,
					opacity:0,
				}, 300, function() {
					prepareNextPanel();
				});

			} else {
				prepareNextPanel();
			}
		},


		/**
		 * refreshMyApps
		 */

		refreshMyApps: function(next) {

			// ensure we have a good location
			System.hasLocation(function(error, location) {

				if(error) {
					// load panel with device selections
					return this.showPanel('searchmyapps');
				}

				return next();

			}.bind(this));

		},

		/****
		 **** Select(ors)
		 ****/

		/**
		 * selectGoBack
		 */
		selectGoBack: function() {

			if(this.__panelPath.length > 1) {

				var lastPanel = this.__panelPath[this.__panelPath.length - 2];

				this.__panelPath.pop();

				this.showPanel(lastPanel);

			}

			return false;
		},

		/**
		 * selectCreateAppDrive
		 */
		selectCreateAppDrive: function() {
			this.showPanel('drives', function(item) {

				this.disableSidebar();

				this.showPanel('installAppDrive', false, function(panel) {

					var progress = Layout.progress(panel.find(".progress"));

					// install runtime
					System.installLatestRuntime(item.mountpoint, function() {



						this.enableSidebar();

					}.bind(this), progress);

				}.bind(this));

			}.bind(this));
		},


		/**
		 * updateDriveList
		 */
		updateDriveList: function(next, target, callback) {

			var drivelist = target.find(".drivelist");

			System.getDrives(function(error, drives) {

				var list = Layout.items("DriveListItem", drives);

				// build list
				drivelist.empty().append(list);

				// build handler
				drivelist.on("click", "fragment", function() {

					if(callback) {
						callback($(this).data("data"));
					}

				});

				// next
				next();
			});

		}
	};


	/**
	 * Intialize Interface after jQuery is loaded
	 */

	$(function() {
		Interface.initialize();
	});

}).call(this);


