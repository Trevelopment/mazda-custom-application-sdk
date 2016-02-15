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
	 * Vehicle
	 */

	vehicle: {

		speed: {name: 'VDTVehicleSpeed', friendlyName: 'Vehicle Speed', input: 'range', min: 0, max: 120},
		rpm: {name: 'VDTEngineSpeed', friendlyName: 'Engine RPM', input: 'range', min: 0, max: 8000},

	},

	/**
	 * GPS
	 */

	gps: {
		latitude: {name: 'GPSLatitude'},
		longitude: {name: 'GPSLongitude'},
		altitude: {name: 'GPSAltitude'},
		heading: {name: 'GPSHeading', input: 'range', min: 0, max: 360, step:45},
		velocity: {name: 'GPSVelocity'},
		timestamp: {name: 'GPSTimestamp'},

	},

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
		{table: 'gps', prefix: 'GPS', enabled: true, filter: 'gps'},
		{table: 'idm', prefix: 'IDM', enabled: true},
		{table: 'idmhistory', prefix: 'IDMH', enabled: true},
		{table: 'vdm', prefix: 'VDM', enabled: true},
		{table: 'vdmhistory', prefix: 'VDMH', enabled: true},
		{table: 'vdtcurrent', prefix: 'VDT', enabled: true},
		{table: 'vdthistory', prefix: 'VDTH', enabled: true},
		{table: 'vdtpid', prefix: 'PID', enabled: true},
		{table: 'vdtsettings', prefix: 'VDTS', enabled: true},
	],

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
	 * (get) returns a data key
	 */

	get: function(name) {
		name = name.toLowerCase();

		return this.data[name] ? this.data[name] : false;
	},

	/**
	 * (setValue) sets the value of the key
	 */

	setValue: function(id, value) {

		CustomApplicationLog.debug(this.__name, "Setting new value", {id: id, available: this.data[id] ? true : false, value: value});	

		if(this.data[id]) {

			this.data[id].changed = this.data[id] != value;
			this.data[id].previous = this.data[id].value;
			this.data[id].value = value;

			// notify
			CustomApplicationsHandler.notifyDataChange(id, this.data[id]);
		}

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

		CustomApplicationLog.debug(this.__name, "Retrieving data tables");	

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

			if(parts.length >= 5) {

				// filter by type
				if(parts[1]) {
					switch(parts[1].toLowerCase()) {

						case "binary":
							break;

						case "double":

							parts[4] = parts[4] + (parts[5] ? "." + parts[5] : "");

						default:
							
							var id = $.trim(parts[0]),
								value = $.trim(parts[4]);

							// check prefix
							if(table.prefix) id = table.prefix + id;

							id = id.toLowerCase();

							// assign
							if(!this.data[id]) {
								this.data[id] = {
									id: id,
									prefix: table.prefix,
									value: null,
									previous: null,
									changed: false,
									type: $.trim(parts[1]),
									name: $.trim(parts[0]), 
								}
							}

							// update
							this.setValue(id, value);

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
					Timestamp: 2,
					Latitude: 3,
					Longitude: 4,
					Altitude: 5,
					Heading: 6,
					Velocity: 7,
				}

				// assign
				$.each(parser, function(name, index) {

					if(data[index]) {
						// parse data
						var line = $.trim(data[index]).split(" ");
						if(line[1]) {
							var type = line[0] != "double" ? "int" : "double";
							result.push(name + " (" + type + ", 4): " + $.trim(line[1]));
						}
					}

				});

				return result;
				break;
		}

	}


};
