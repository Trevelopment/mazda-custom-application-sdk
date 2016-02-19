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

var BLA = "FOO";


/**
 * Interface
 */


(function() {

	Interface = {

		/**
		 * Privates
		 */

		// statuses
		runtimeLoaded: false,
		appsLoaded: false,

		/**
		 * (initialize)
		 *
		 * Initializes the interface and simulator
		 */

		initialize: function() {

			// startup console
			Logger.info("Starting up");

			// ready framework
			framework.ready();

			// assign elements
			this.root = $("#interface");

			this.view = $("#view");

			this.surface = $("#surface");

			this.menu = $("#menu");

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
			this.loadRuntime(function() {

				// runtime was loaded
				this.loadApplications(function() {

					// show app menu
					this.showAppMenu();

				}.bind(this));

			}.bind(this));

			// register ipc messages
			var ipc = require('ipc');

			ipc.on('runtimeLocation', function(location) {
				localStorage.setItem("runtimeLocation", location);
				this.loadRuntime();
		    }.bind(this));

		    ipc.on('appsLocation', function(location) {
				localStorage.setItem("appsLocation", location);
				this.loadApplications();
		    }.bind(this));

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
			Logger.info(sprintr("Loading runtime from {0}", runtimeLocation));

			// reset
			window.CustomApplicationsHandler = false;

			// load runtime.js
			framework.loadJS("file://" + runtimeLocation + "/runtime.js", function() {

				// load CustomApplicationSurfaceTmplt
				framework.loadJS("file://" + runtimeLocation + "/surface/CustomApplicationSurfaceTmplt/js/CustomApplicationSurfaceTmplt.js", function() {

					if(typeof(CustomApplicationsHandler) == "undefined")
						return Logger.error("Error while loading the runtime package.");

					// enable logger
					CustomApplicationLog.enableLogger(true);

					// overwrite paths
					CustomApplicationsHandler.paths.framework = "file://" + runtimeLocation + "/";
					CustomApplicationsHandler.paths.vendor = "file://" + runtimeLocation + "/vendor/";

					// load data

			       	CustomApplicationDataHandler.pause();
			       	CustomApplicationDataHandler.paths.data = "file://" + __dirname + "/../data/casdk-";

			       	Logger.info("Attempting to load vehicle mock data");
			        CustomApplicationDataHandler.retrieve(function(data) {
			        	this.setVehicleData(data);
			        }.bind(this));

					// done
					this.runtimeLoaded = true;

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

			this.appsLoaded = false;
			this.applications = false;

			var appsLocation = localStorage.getItem("appsLocation");

			// check
			if(!appsLocation)
				return Logger.error("You need to select the location of the applications first.");

			// override applications handler
			CustomApplicationsHandler.paths.applications = "file://" + appsLocation + "/";

			// load runtime
			Logger.info(sprintr("Loading applications from {0}", appsLocation));

			// load applications
			CustomApplicationsHandler.retrieve(function(items) {

				this.applications = items;

				this.appsLoaded = true;

				if(Is.fn(callback)) callback();

	        }.bind(this));
		},


		/**
		 * (showAppMenu)
		 *
		 * Renders the application list
		 */

		showAppMenu: function() {

			// sanity check
			if(!this.appsLoaded || !this.applications) return;

			// clear last application
			localStorage.setItem("lastRunApplication", false);

			// cleanup framework
			framework.cleanup();

			// prepare menu
			this.menu.html("");
            this.applications.forEach(function(item) {

            	this.menu.append($("<a/>").attr("appId", item.appData.appId).on("click", function() {
            		this.invokeApplication(item.appData.appId);
            	}.bind(this)).append(item.title));

            }.bind(this));

            // reset view
			this.view.fadeOut();
			this.menu.fadeIn();
			this.leftButton.fadeOut();
			this.statusBar.fadeIn();

			// update view
			framework.common.statusBar.setAppName('Applications');
			framework.common.statusBar.setDomainIcon(false);

		},

		/**
		 * (invokeApplication)
		 */

		invokeApplication: function(appId) {

			// fadeout menu
			this.menu.fadeOut();

			// update last run application
			localStorage.setItem("lastRunApplication", appId);

			// run application
			CustomApplicationsHandler.run(appId);
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
	}

	/**
	 * Intialize Interface after jQuery is loaded
	 */

	$(function() {
		Interface.initialize();
	});

}).call(this);


