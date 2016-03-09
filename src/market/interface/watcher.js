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
 * File Watcher
 */

fs = require("fs");

Watcher = (function() {

	function Watcher(location, id, callback) {

		this.location = location;
		this.callback = callback;
		this.id = id;

		this.init();

	};

	Watcher.prototype = {

		init: function() {

			Logger.watch("Watching for changes in " + this.location, this.id);

			this.instance = fs.watch(this.location, function(event, filename) {

				clearTimeout(this.watchTimer);

				// report all watch events
				Logger.watch("Received watch event " + event + (filename ? " for " + filename : ""), this.id);

				// restart timer
				this.watchTimer = setTimeout(function() {

					// reload
					Logger.watch("Changed detected in " + this.location, this.id);

					// execute callback
					if(Is.fn(this.callback)) this.callback();

				}.bind(this), 850); // give it about 850ms to finish

			}.bind(this));
		},

		start: function() {
			if(!this.instance) this.init();
		},

		close: function() {

			Logger.watch("Removing watch in " + this.location, this.id);

			this.instance.close();
		},
	};

	return Watcher;

}.call());
