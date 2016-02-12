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
 * (CustomApplicationDataHandler)
 *
 * This is the data controller that reads the current vehicle data
 */

var CustomApplicationDataHandler = {

	__name: 'DataHandler',

	/**
	 * (Locals)
	 */

	refreshRate: 800,

	/**
	 * (Paths)
	 */

	paths: {
		data: 'apps/system/custom/runtime/data/casdk-',
	},

	/**
	 * (Tables)
	 */

	tables: [
		{table: 'gps', enabled: false, filter: 'gps'},
		{table: 'idm', enabled: false},
		{table: 'idmhistory', enabled: false},
		{table: 'vdm', enabled: true},
		{table: 'vdmhistory', enabled: false},
		{table: 'vdtcurrent', enabled: false},
		{table: 'vdthistory', enabled: false},
		{table: 'vdtpid', enabled: false},
		{table: 'vdtsettings', enabled: false},
	],

	/**
	 * (Pools)
	 */

	current: {},
	buffer: {},


	/**
	 * (initialize) Initializes some of the core objects
	 */

	initialize: function() {

		//this.multicontroller = typeof(Multicontroller) != "undefined" ? new Multicontroller(this.handleControllerEvent) : false;

		this.initialized = true;

		this.next();
	},

	/**
	 * (next)
	 */

	next: function() {

		setTimeout(function() {

			this.retrieve();

		}.bind(this), this.refreshRate)
	},


	/**
	 * (retrieve) loads the data
	 */

	retrieve: function() {

		CustomApplicationLog.info(this.__name, "Retrieving data tables");	

		// prepare
		var loaded = 0, toload = 0, finish = function() {

			if(loaded >= toload) {

				this.current = this.buffer;

				this.notify();

			}

		}.bind(this);

		// reset buffer
		this.buffer = {};

		// build to load list
		this.tables.map(function(table) {

			if(table.enabled) {

				toload++;

				var location = this.paths.data + table.table;

				CustomApplicationLog.debug(this.__name, "Preparing table for load", {table: table.table, location: location});	

				$.get(location, function(data) {

					loaded++;

					CustomApplicationLog.debug(this.__name, "Loaded table", {table: table.table, loaded: loaded, toload: toload});	

					this.process(table, data);

					finish();

				}.bind(this));
			}
		}.bind(this));		
	},


	/**
	 * (process)
	 */

	process: function(table, data) {

		if(table.filter) data = this.filter(data);

		// quick process
		(data.split("\n")).forEach(function(line, index) {

			var parts = line.split(/[\((,)\).*(:)]/);

			// filter by type
			


		}.bind(this));
	},


};
