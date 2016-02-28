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
 * Multicontroller
 */

(function() {

	Multicontroller = {

		/**
		 * Initialize
		 */

		initialize: function() {

			var that = this;

			this.multicontroller = $("#multicontroller");

			// initialize hit areas for direction
			this.multicontroller.on("mousedown", "span.hitarea", function(event) {

				// set hit
				$(this).addClass("hit");

				// set direction
				var direction = $(this).attr("direction");
				if(direction) that.setMultiControllerDirection(direction);

			});

			// initialize hit areas for direction
			this.multicontroller.on("mouseup mouseleave", "span.hitarea", function(event) {

				// remove hit
				$(this).removeClass("hit");

				// clear direction
				var direction = $(this).attr("direction");
				if(direction) that.setMultiControllerDirection(false);

				// notify
				if(event.type == "mouseup") {
					that.notifyMultiController($(this).attr("event"));
				}
			});


			// initialize wheel turn
			var base = this.multicontroller.find("div.wheel.base"),
				baseMoved = false,
				baseEnabled = false,
				wheelPosition = 0;
				position = false;

			base.on("mousedown", function(event) {
				baseEnabled = true;
				baseMoved = false;
				position = {
					x: event.clientX,
					y: event.clientY
				};
			});

			base.on("mousemove", function(e) {
				if(baseEnabled) {

					baseMoved = true;

					var event = false,
						dx = position.x - e.clientX,
						dy = position.y - e.clientY,
						treshold = 10;


					if(Math.abs(dx) > treshold || Math.abs(dy) > treshold) {

						switch(true) {

							/** ccw **/

							// left
							case (Math.abs(dx) > Math.abs(dy) && dx > 0):
							// down
							case (Math.abs(dy) > Math.abs(dx) && dy < 0):

								wheelPosition -= 45;
								if(wheelPosition < 0) wheelPosition = 360 + wheelPosition;
								event = "ccw";
								break;

							/** cw **/

							// right
							case (Math.abs(dx) > Math.abs(dy) && dx < 0):
							// up
							case (Math.abs(dy) > Math.abs(dx) && dy > 0):

								wheelPosition += 45;
								if(wheelPosition > 360) wheelPosition -= 360;
								event = "cw";
								break;
						}

						// notify
						if(event) {

							// set wheel
							base.css("transform", "rotate(" + wheelPosition + "deg)");

							// reset position
							position = {
								x: e.clientX,
								y: e.clientY
							};

							// notify
							that.notifyMultiController(event);
						}
					}
				}
			});

			base.on("mouseup mouseleave", function(event) {

				if(baseEnabled && !baseMoved) {
					that.notifyMultiController("selectStart");
				}
				baseEnabled = false;
			});

			// initialize panel
			this.multicontroller.find("#panel").on("click", "span", function() {
				that.notifyMultiController($(this).attr("event"));
			});

			// initialize keystrokes
			$(document).keyup(function(e) {

				switch(e.keyCode) {

					case 49: this.notifyMultiController("cw"); break;
					case 50: this.notifyMultiController("ccw"); break;
					case 38: this.notifyMultiController("upStart"); break;
					case 40: this.notifyMultiController("downStart"); break;
					case 37: this.notifyMultiController("leftStart"); break;
					case 39: this.notifyMultiController("rightStart"); break;
					case 13: this.notifyMultiController("selectStart"); break;
					case 8: this.notifyMultiController("home"); break;


				}

			}.bind(this));

		},

		setMultiControllerDirection: function(direction) {
			if(!direction) {
				this.multicontroller.find("div.wheel.direction").hide();
				this.multicontroller.find("div.wheel.base").show();
			} else {
				this.multicontroller.find("div.wheel.direction").attr("direction", direction).show();
				this.multicontroller.find("div.wheel.base").hide();
			}
		},

		notifyMultiController: function(event) {

			// visualize event
			var pb = this.multicontroller.find("#panel [event=" + event + "]").addClass("hit");
			setTimeout(function() {
				pb.removeClass("hit");
			}, 450);

			// switch by type
			switch(true) {

				case Interface.inAppMenu:

					// mini handler for app menu
					switch(event) {

						case "upStart":

							Interface.menuIndex -= 1;
							if(Interface.menuIndex < 0) Interface.menuIndex = Interface.maxMenuIndex - 1;
							break;

						case "downStart":

							Interface.menuIndex += 1;
							if(Interface.menuIndex >= Interface.maxMenuIndex) Interface.menuIndex = 0;
							break;

						case "selectStart":

							return Interface.invokeApplication(Interface.menuIndexAppId);

							break;

					}

					// assign
					Interface.setAppMenuFocus(true);

					break;

				default:

					if(event == "home") {
						Interface.showAppMenu();
					} else {

						// pass to current
						if(framework.current) {
							framework.current.handleControllerEvent(event);
						}
					}

					break;
			}
		},
	};

}.call(this));