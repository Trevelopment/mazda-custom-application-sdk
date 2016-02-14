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
 * (VehicleData) a collection of mapping 
 */

var VehicleData = {

	/**
	 * Constants
	 */

	KMHMPH: 0,


	/*
	 * Mapping
	 */

	vehicleSpeed: 'vehicleSpeed',



};

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

	refreshRate: 960,

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
		{table: 'gps', enabled: true, filter: 'gps'},
		{table: 'idm', enabled: true},
		{table: 'idmhistory', enabled: true},
		{table: 'vdm', enabled: true},
		{table: 'vdmhistory', enabled: true},
		{table: 'vdtcurrent', enabled: true},
		{table: 'vdthistory', enabled: true},
		{table: 'vdtpid', enabled: true},
		{table: 'vdtsettings', enabled: true},
	],

	/**
	 * (mapping)
	 */

	mapping: {
		gps: {
			heading: 'gpsHeading',
			speed: 'gpsSpeed',
		},	

		vehicleSpeed: 'vehiclespeed',
	},

	/**
	 * (Pools)
	 */

	data: {},

	/**
	 * (initialize) Initializes some of the core objects
	 */

	initialize: function() {

		this.initialized = true;

		this.next();
	},

	/**
	 * (pause)
	 */

	pause: function() {

		this.paused = true;

	},

	unpause: function() {

		this.paused = false;

		this.next();
	},

	/**
	 * (next)
	 */

	next: function() {

		setTimeout(function() {

			if(!this.paused) {

				if(CustomApplicationsHandler.currentApplicationId) {

					this.retrieve();

				} else {

					this.next();
				}
			}

		}.bind(this), this.refreshRate)
	},


	/**
	 * (retrieve) loads the data
	 */

	retrieve: function(callback) {

		//CustomApplicationLog.info(this.__name, "Retrieving data tables");	

		// prepare
		var loaded = 0, toload = 0, finish = function() {

			if(loaded >= toload) {

				// notify the callback
				if(CustomApplicationHelpers.is().fn(callback)) {
					callback(this.data);
				}

				// continue
				this.next();
			}

		}.bind(this);

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

		// split data
		data = data.split("\n");

		// filter
		if(table.filter) data = this.filter(data, table.filter);
	
		// quick process
		data.forEach(function(line, index) {

			var parts = line.split(/[\((,)\).*(:)]/);

			if(parts.length == 5) {

				// filter by type
				if(parts[1]) {
					switch(parts[1].toLowerCase()) {

						case "binary":

							break;

						default:
							
							var id = parts[0].toLowerCase(),
								value = $.trim(parts[4]);

							if(this.mapping[id]) {
								id = this.mapping[id];
							}

							if(!this.data[id]) {
								this.data[id] = {
									value: null,
									previous: null,
									changed: false,
									type: parts[1],
									name: parts[0], 
								}
							}

							this.data[id].changed = this.data[id] != value;
							this.data[id].previous = this.data[id].value;
							this.data[id].value = value;

							CustomApplicationsHandler.notifyDataChange(id, this.data[id]);

							break; 

					}
				}
			}


		}.bind(this));
	},

	/**
	 * Filter
	 */

	filter: function(data, filter) {

		switch(filter) {

			case "gps":

				var result = [], parser = {
					GPSTimestamp: 2,
					GPSLatitude: 3,
					GPSLongitude: 4,
					GPSAltitude: 5,
					GPSHeading: 6,
					GPSVelocity: 7,
				}

				// assign
				$.each(parser, function(name, index) {

					if(data[index]) {
						// parse data
						var line = $.trim(data[index]).split(" ");
						if(line[1]) {
							result.push(name + "(int, 0): " + $.trim(line[1]));
						}
					}

				});

				return result;
				break;
		}

	}


};
