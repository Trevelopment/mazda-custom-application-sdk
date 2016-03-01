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
 * Logger
 */

(function() {

	/**
	 * Globals
	 */

	LoggerFilterLevel = false;

	/**
	 * Logger
	 */

	Logger = {

		defaultId: 'Simulator',

		error: function(message, id) {
			this.log('ERROR', id ? id : this.defaultId, message);
		},

		info: function(message, id) {
			this.log('INFO', id ? id : this.defaultId, message);
		},

		debug: function(message, id) {
			this.log('DEBUG', id ? id : this.defaultId, message);
		},

		watch: function(message, id) {
			this.log('WATCH', id ? id : this.defaultId, message);
		},

		log: function(level, id, message, color) {

			var item = $("<div/>").attr("level", level);

			item.append($("<span/>").append((new Date()).format("H:i:s")));
			item.append($("<span/>").addClass(level).append(level));
			item.append($("<span/>").append(id));
			item.append($("<span/>").addClass(level).append(message));

			// check LoggerFilterLevel
			if(LoggerFilterLevel && level != LoggerFilterLevel) item.hide();

			// add to output
			$("#output").append(item);
			$("#output").scrollTop($("#output").get(0).scrollHeight);
		},

	};


	/**
	 * Global Error
	 */
	onerror = function(message, url, line) {
		Logger.log("ERROR", Logger.defaultId + ":" + url.replace(/^.*[\\\/]/, '') +":" + line, message);
	};

	/**
	 * Initialize console
	 */

	$(function() {

		$("#actions").on("click", "li", function() {

			var callMethod = $(this).attr("call");

			if(Is.fn(Interface[callMethod])) Interface[callMethod]();

		});

		$("#levelbuttons").on("click", "li", function() {

			$("#console").find(".consolewindow").hide();

			switch($(this).attr("target")) {

				case "output":

					LoggerFilterLevel = $(this).attr("level");

					if(!LoggerFilterLevel) {
						$("#output").find("div").show();
					} else {
						$("#output").find("div").hide();
						$("#output").find("div[level=" + LoggerFilterLevel + "]").show();
					}

					// scroll to bottom
					$("#output").scrollTop($("#output").get(0).scrollHeight);

				default:

					$("#" + $(this).attr("target")).show();
					break;

			}

			// set correct markers
			$(this).parent().find("li.focus").removeClass("focus");
			$(this).addClass("focus");

		});

		$("#clearbutton").on("click", function() {
			$("#output").empty();
		});
	});

}.call(this));



