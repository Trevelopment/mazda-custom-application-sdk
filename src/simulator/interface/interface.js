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

		// statuses
		runtimeLoaded: false,
		appsLoaded: false,

		inAppMenu: false,

		/**
		 * (initialize)
		 *
		 * Initializes the interface and simulator
		 */

		initialize: function() {

			// startup console
			Logger.info("Starting up on platform " + process.platform);

			// ready framework
			framework.ready();

			// load additional css
			if(process.platform.substr(0, 3) == "win") {
				framework.loadCSS("interface-win.css");
			}

			// assign elements
			this.root = $("#interface");

			this.view = $("#view");

			this.surface = $("#surface");

			this.menu = $("#menuitems");

			this.leftButton = $("#leftbutton");

			this.statusBar = $("#statusbar");

			this.dataView = $("#dataview");

			// assign core actions to static elements
			$("#home").on("click", function() {
				this.showAppMenu();
			}.bind(this));

			$("#leftbutton").on("click", function() {
				this.showAppMenu();
			}.bind(this));

			// initialize multi controller
			Multicontroller.initialize();

			// try to load runtime
			this.refresh();

			// register ipc messages
			var ipc = require('ipc');

			ipc.on('runtimeLocation', function(location) {
				localStorage.setItem("runtimeLocation", location);
				this.loadRuntime(function() {
					this.showFromRecover();
				}.bind(this));
		  }.bind(this));

		    ipc.on('appsLocation', function(location) {
				localStorage.setItem("appsLocation", location);
				this.loadApplications(function() {
					this.showFromRecover();
				}.bind(this));
		  }.bind(this));

		    // initialize storage
			$(window).on('storage', function (e) {

				console.log(e);
			});
		},

		/**
		 * (refresh)
		 */

		refresh: function() {

			// load runtime
			this.loadRuntime(function() {

				// runtime was loaded
				this.loadApplications(function() {

					// show app menu
					this.showFromRecover();

				}.bind(this));

			}.bind(this));
		},

		/**
		 * (reload)
		 */

		reload: function() {
			this.refresh();
			//document.location.reload(true);
		},

		/**
		 * (loadRuntime)
		 */

		loadRuntime: function(callback) {

			this.runtimeLoaded = false;

			var runtimeLocation = localStorage.getItem("runtimeLocation");

			// check
			if(!runtimeLocation)
				return Logger.error("You need to select the location of the runtime package first.");

			// load runtime
			Logger.info(sprintr("Loading system runtime from {0}", runtimeLocation));

			// reset
			window.CustomApplicationsHandler = false;

			// stop watcher
			if(this.runtimeWatcher) this.runtimeWatcher.close();

			// unload scripts
			$("script[src*='" + runtimeLocation + "/runtime']").remove();
			$("script[src*='" + runtimeLocation + "/templates']").remove();
			$("link[href*='" + runtimeLocation + "/runtime']").remove();
			$("link[href*='" + runtimeLocation + "/templates']").remove();

			// load runtime.js
			framework.loadJS("file://" + runtimeLocation + "/runtime/runtime.js", function() {

				// load CustomApplicationSurfaceTmplt
				framework.loadJS("file://" + runtimeLocation + "/templates/SurfaceTmplt/js/SurfaceTmplt.js", function() {

					if(typeof(CustomApplicationsHandler) == "undefined")
						return Logger.error("Error while loading the runtime package.");

					// load css
					framework.loadCSS("file://" + runtimeLocation + "/runtime/runtime.css");

					// enable logger
					CustomApplicationLog.enableLogger(true);

					// overwrite paths
					CustomApplicationsHandler.paths.framework = "file://" + runtimeLocation + "/runtime/";
					CustomApplicationsHandler.paths.vendor = "file://" + runtimeLocation + "/runtime/vendor/";

					// load data
			       	CustomApplicationDataHandler.pause();
			       	CustomApplicationDataHandler.paths.data = "file://" + __dirname + "/../data/casdk-";

			       	Logger.info("Attempting to load vehicle mock data");
			        CustomApplicationDataHandler.retrieve(function(data) {
			        	this.setVehicleData(data);
			        }.bind(this));

					// done
					this.runtimeLoaded = true;

					// engage watcher
					this.runtimeWatcher = new Watcher(runtimeLocation, "runtime", function() {

						// reload entire window
						this.refresh();

					}.bind(this));

					// callback
					if(Is.fn(callback)) callback();

				}.bind(this));

			}.bind(this));
		},

		/**
		 * (loadApplications)
		 */

		loadApplications: function(callback) {

			// sanity check
			if(!this.runtimeLoaded || typeof(CustomApplicationsHandler) == "undefined")
				return Logger.error("Error while loading applications. No runtime system was loaded.");

			// stop watchers
			this.deregisterApplicationWatchers();

			// clear
			this.appsLoaded = false;
			this.applications = false;

			// cleanup framework
			framework.cleanup();

			// load from location
			var appsLocation = localStorage.getItem("appsLocation");

			// check
			if(!appsLocation)
				return Logger.error("You need to select the location of the applications first.");

			// load runtime
			Logger.info(sprintr("Loading applications from {0}", appsLocation));

			// stop watcher
			if(this.appsWatcher) this.appsWatcher.close();

			// unload scripts
			$("script[src*='" + appsLocation + "']").remove();
			$("link[href*='" + appsLocation + "']").remove();

			// assign new dir
			CustomApplicationsHandler.paths.applications = "file://" + appsLocation + "/";

			// load from dir
			fs.readdir(appsLocation, function(err, data) {

				if(err) return Logger.error(sprintr("Unable to load applications from {0}", appsLocation));

				// initialize
				var appsToLoad = [];

				// process data
				for(var i = 0; i < data.length; i++) {

					var path = appsLocation + "/" + data[i];

					if(fs.lstatSync(path).isDirectory()) {
						appsToLoad.push(data[i]);
					}
				}

				// invoke custom application loader
				try {

					CustomApplicationsHandler.initialize();

					CustomApplicationsHandler.loader.loadJavascript(
						CustomApplicationsHandler.loader.fromFormatted("{0}/app.js", appsToLoad),
						CustomApplicationsHandler.paths.applications,
						function() {

							// create menu items
							this.completeApplications(CustomApplicationsHandler.getMenuItems(), callback);

						}.bind(this)
					);
				} catch(e) {
					// error message
					CustomApplicationsHandler.log.error(this.__name, "Error while retrieving applications", e);

					// make sure that we notify otherwise we don't get any applications
					his.completeApplications(CustomApplicationsHandler.getMenuItems(), callback);
				}
			}.bind(this));
		},

		/**
		 * (completeApplications)
		 */

		completeApplications: function(items, callback) {

			var appsLocation = localStorage.getItem("appsLocation");

			// assign items
			this.applications = items;
			this.applicationsWatchers = Array.apply(null, Array(items.length));

			// register watchers
			this.registerApplicationWatchers();

			// reload apps
			this.appsLoaded = true;

			// engage watcher for apps.js

			this.appsWatcher = new Watcher(appsLocation, "applications", function() {

				// reload
				this.loadApplications();

			}.bind(this));


			// callback
			if(Is.fn(callback)) callback();
		},

		/**
		 * (showFromRecover)
		 *
		 * Shows an application that previously invoked or display the menu
		 */

		showFromRecover: function() {

			clearTimeout(this.recoverTimer);

			this.recoverTimer = setTimeout(function() {

				// sanity check
				if(!this.appsLoaded || !this.applications) return;

				// run last app id
				if(this.lastApplicationId && this.invokeApplication(this.lastApplicationId)) {
					return;
				}

				// show app menu
				this.showAppMenu();

			}.bind(this), 250);

		},

		/**
		 * (showAppMenu)
		 *
		 * Renders the application list
		 */

		showAppMenu: function() {

			// sanity check
			if(!this.appsLoaded || !this.applications) return;

			// clear current application
			this.lastApplicationId = false;

			// cleanup framework
			framework.cleanup();

			// prepare menu
			this.menu.html("");

			// create items
            this.applications.forEach(function(item, index) {

            	// get title and id
            	var id = item.appData ? item.appData.appId : item.id,
            		title = item.appData ? item.title : item.getTitle();

            	this.menu.append($("<a/>").attr({
            		appId: id,
            		menuIndex: index,
            	}).on({

            		click: function() {

            			this.invokeApplication(id);

            		}.bind(this),

            	}).hover(function() {

        			this.menuIndex = index;
        			this.setAppMenuFocus();

        		}.bind(this)).append(title));

            }.bind(this));

            // select first
            this.menuIndex = 0;
            this.maxMenuIndex = this.applications.length;
            this.setAppMenuFocus();

            // reset view
			this.view.fadeOut();
			this.menu.fadeIn();
			this.leftButton.fadeOut();
			this.statusBar.fadeIn();

			// update view
			framework.common.statusBar.setAppName('Applications');
			framework.common.statusBar.setDomainIcon(false);

			this.inAppMenu = true;

		},

		/**
		 * setAppMenuFocus
		 */

		setAppMenuFocus: function(mc) {

			// clear
			this.menu.find(".focus").removeClass("focus");

			// set new
			var item = this.menu.find("[menuIndex=" + this.menuIndex + "]").addClass("focus");

			this.menuIndexAppId = item.attr("appId");

			if(mc) {
				this.menu.scrollTop(item.position().top);
			}

		},

		/**
		 * (invokeApplication)
		 */

		invokeApplication: function(appId) {

			// fadeout menu
			this.menu.fadeOut();

			// run application
			var result = CustomApplicationsHandler.launch(appId);

			// update application panel
			//Logger.updateApplication(CustomApplicationsHandler.applications[appId]);

			// check result
			if(result) {
				// send to mmui
				framework.sendEventToMmui();

				// disable app menu
				this.inAppMenu = false;
				this.lastApplicationId = appId;

				this.setStorageView(appId);
			}

			return result;
		},


		/**
		 * Vehicle Data
		 */

		setVehicleData: function(data) {

			// create groups
			var groups = [
				{name: 'General', mapping: VehicleData.general},
				{name: 'Vehicle Data', mapping: VehicleData.vehicle},
				{name: 'Vehicle Fuel', mapping: VehicleData.fuel},
				{name: 'Vehicle Temperatures', mapping: VehicleData.temperature},
				{name: 'GPS', mapping: VehicleData.gps},
				{name: 'All Vehicle Data', values: data}
			];

			// clear empty
			this.dataView.empty();

			// rebuild vehicle data
			groups.forEach(function(group) {

				// prepare mapping to value table
				if(group.mapping) {

					// get actual values
					var values = [];
					$.each(group.mapping, function(id, params) {

						if(params.id) {
							var tmp = CustomApplicationDataHandler.get(params.id);
							if(tmp) {
								params.value = tmp.value;
								values.push($.extend(params, tmp));
							}
						}
					});

				} else {

					// build data array
					var values = $.map(group.values, function(value) {
						return value;
					});
				}


				// create group
				var groupDiv = $("<div/>").addClass("group").appendTo(this.dataView);
				$("<span/>").addClass("title").append(group.name).appendTo(groupDiv);

				// create group container
				var container = $("<div/>").addClass("items").appendTo(groupDiv);

				// sort by name
				values.sort(function(a, b) {
					return a.name > b.name ? 1 : -1;
				});

				// set keys
				values.forEach(function(value) {

					var item = $("<div/>").addClass("item").appendTo(container);

					var tp = value.type;
					switch(value.type) {
						case "string": tp= "str"; break;
						case "double": tp = "dbl"; break;
						default: tp = "int"; break;
					}

					$("<span/>").append(value.prefix ? value.prefix : "DATA").addClass(value.prefix).appendTo(item);
					$("<span/>").append(tp).addClass(value.type).appendTo(item);
					$("<span/>").append(value.friendlyName ? value.friendlyName : value.name).appendTo(item);

					var editorContainer = $("<span/>").appendTo(item);

					switch(value.input) {

						case "list":
							var editor = $("<select/>").appendTo(editorContainer);

							// build list
							$.each(value.values, function(k, v) {

								editor.append($("<option/>").val(k).append(v));

							});

							editor.val(value.value);

							break;

						case "range":
							var editor = $("<input/>").attr({type: "range", min: value.min, max: value.max, step: value.step | 1}).val(value.value).appendTo(editorContainer),
								editorLabel = $("<span/>").addClass("inputlabel").html(value.value).appendTo(editorContainer);
							break;

						default:
							var editor = $("<input/>").val(value.value).appendTo(editorContainer);
							break;
					}

					if(editor) {
						editor.on("input", function() {

							if(editorLabel) {
								editorLabel.html($(this).val());
							}

							var v = editor.val();

							if(value.factor) v = v / value.factor;

							// notify customer Handler
							CustomApplicationDataHandler.setValue(value.id, v);
						});
					}


				}.bind(this));

			}.bind(this));

		},


		/**
		 * (registerApplicationWatchers)
		 */

		registerApplicationWatchers: function() {

			if(!this.applications || !this.applicationsWatchers) return false;

			// clear all watchers
			this.deregisterApplicationWatchers();

			// get location
			var appsLocation = localStorage.getItem("appsLocation");

			// sanity check
			if(!appsLocation) return false;

			// register new watchers
			this.applications.forEach(function(item, index) {

				var fn = appsLocation + "/" + item.appData.appId;

				this.applicationsWatchers[index] = new Watcher(fn, item.appData.appId, function() {

					// reload this specific application
					this.reloadApplication(item.appData.appId, fn, index);


				}.bind(this));

			}.bind(this));

			return true;
		},

		/**
		 * (deregisterApplicationWatchers)
		 */

		deregisterApplicationWatchers: function() {

			if(!this.applicationsWatchers) return false;

			this.applicationsWatchers.forEach(function(item, index) {

				if(this.applicationsWatchers[index]) {
					this.applicationsWatchers[index].close();
					this.applicationsWatchers[index] = false;
				}

			}.bind(this));
		},

		/**
		 * (reloadApplication)
		 *
		 * This is a tricky one since I don't want to adjust the micro framework we need to
		 * replace during runtime the application and reregister it.
		 */

		reloadApplication: function(id, location, index) {

			// clean up current application
			if(this.lastApplicationId == id) {
				framework.cleanup();
			}

			// first destroy the current application
			if(CustomApplicationsHandler.applications[id]) {
				CustomApplicationsHandler.sleep(CustomApplicationsHandler.applications[id]);
			}

			// unload scripts
			$("script[src*='" + location + "']").remove();
			$("link[href*='" + location + "']").remove();

			// reload the current application
			framework.loadJS("file://" + location + "/app.js", function() {

				// app should be reappared by now
				if(CustomApplicationsHandler.applications[id]) {

					// show notification
					this.notify("Application " + CustomApplicationsHandler.applications[id].title + " has been reloaded.");

					// reassign application to array
					this.applications[index] = CustomApplicationsHandler.applications[id];

					// reload app or show screen
					this.showFromRecover();

				};

			}.bind(this));

		},


		/**
		 * (Notify) sends a desktop notification - Disabled for now until I have a settings page
		 */

		notify: function(content, title) {

			/*if(Notification) {

				var title = title ? title : 'Simulator';

				new Notification(title, {
					title: title,
					body: content
				});
			}*/

		},


		/**
		 * (setStorageView)
		 */

		setStorageView: function(appId) {
			
			
		},
	}

	/**
	 * Intialize Interface after jQuery is loaded
	 */

	$(function() {
		Interface.initialize();
	});

}).call(this);


