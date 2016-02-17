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
 * Mock IDE Environment - This needs major cleanup :-)
 */

window.onerror = function(message, url, line) {
	logger.log("ERROR", "Line " + line, message);
}

// (log)
var log = {

	addSrcFile: function() {},

	debug: function() {

		//console.log(arguments);
	},


};

var logger = {

	log: function(level, id, message, color) {

		var item = $("<div/>");

		item.append($("<span/>").append((new Date()).toLocaleTimeString()));
		item.append($("<span/>").addClass(level).append(level));
		item.append($("<span/>").append(id));
		item.append($("<span/>").addClass(level).append(message));

		$("#output").append(item);

		$("#output").scrollTop($("#output")[0].scrollHeight);
	},

}	



// (framework)
var framework = {

	current: false,

	init: function() {

		// enable logger
		CustomApplicationLog.enableLogger(true);
		CustomApplicationLog.enableConsole(true);

		// continue with elements
		this.root = $("#mock");

		this.view = $("#view");

		this.surface = $("#surface");

		this.menu = $("#menu");

		this.leftButton = $("#leftbutton");

		this.statusBar = $("#statusbar");

		this.dataView = $("#dataview");

		$("#home").on("click", function() {
			this.showMenu();
		}.bind(this));

		$("#leftbutton").on("click", function() {
			this.showMenu();
		}.bind(this));

		// initialize multi controller
		this.initializeMultiController();

		// pause data handler so we an simulate it
        CustomApplicationDataHandler.pause();
        CustomApplicationDataHandler.retrieve(function(data) {

        	this.setVehicleData(data);

        }.bind(this));

        // finally show menu
		this.showMenu();

	},

	showMenu: function() {

		this.menu.html("");
		this.common.statusBar.setAppName('Applications');
		this.common.statusBar.setDomainIcon(false);

		// load items
		CustomApplicationsHandler.retrieve(function(items) {

            items.forEach(function(item) {

            	this.menu.append($("<a/>").attr("appId", item.appData.appId).click(this.execMenu).append(item.title));

            }.bind(this));
        }.bind(this));

		if(this.current) {
			this.current.cleanUp();
			this.current = false;
		}

		this.view.fadeOut();
		this.leftButton.fadeOut();
		this.statusBar.fadeIn();

	},

	execMenu: function() {

		var id = $(this).attr("appId");

		CustomApplicationsHandler.run(id);

	},

	ready: function(callback) {

	},

	common: {

		statusBar: {

			setAppName: function(title) {

				$("#title").html(title);

			},

			setDomainIcon: function(icon) {

				if(icon) {
					$("#domain").css({"background-image": "url(" + icon + ")"}).show();
				} else {
					$("#domain").hide();
				}

			},

			showHomeBtn: function(show) {
				if(show) {
					$("#home").show();
				} else {
					$("#home").hide();
				}
			},

			clock: {

				innerHTML: false,

				_update: function() {
					 var today = new Date(), h = today.getHours(), m = today.getMinutes();


					 var s = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;

					 $("#clock").html(s);

					 return s;

				},
			}

		},

	},

	loadControl: function(appId, controlId, controlName) {

		// initialize
		var controlName = controlName || (controlId + 'Ctrl'),
			path = "apps/" + appId +"/controls/" + controlId + '/';

		// create resources
		this.loadCSS(path + 'css/' + controlName + '.css');
		this.loadJS(path + 'js/' + controlName + '.js');

	},

	loadCSS: function(filename, callback) {
		var css = document.createElement('link');
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = filename;
        css.onload = callback;
        document.body.appendChild(css);
	},

	loadJS: function(filename, callback) {
		var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = filename;
        script.onload = callback;
        document.body.appendChild(script);
	},

	/**
	 * Vehcile Data
	 */

	setVehicleData: function(data) {

		// create groups
		var groups = [
			{name: 'General', mapping: VehicleData.general},
			{name: 'Vehicle Data', mapping: VehicleData.vehicle},
			{name: 'Vehicle Temperatures', mapping: VehicleData.temperature},
			{name: 'GPS', mapping: VehicleData.gps},
			{name: 'All Vehicle Data', values: data}
		];

		// clear empty
		this.dataView.empty();

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
	 * Mocks
	 */

	registerAppLoaded: function() {},

	registerTmpltLoaded: function() {},

	routeMmuiMsg: function(data) {

		if(data.msgType == "focusStack") {

			// initialize template
			this.current = new CustomApplicationSurfaceTmplt("system", this.surface.get(0), 1);

			switch(true) {

				case this.current.properties.leftButtonVisible:
					this.statusBar.fadeIn();
					this.leftButton.fadeIn();
					this.view.addClass("statusbar leftbutton");
					break;

				case this.current.properties.showStatusbar:
					this.statusBar.fadeIn();
					this.leftButton.fadeOut();
					this.view.addClass("statusbar").removeClass("leftbutton");
					break;

				default:
					this.view.removeClass("statusbar leftbutton");
					break;

			}

			this.view.fadeIn();
		}
	},


	/**
	 * (MultiController)
	 */

	initializeMultiController: function() {

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
		if(event == "home") {
			this.showMenu();
		} else {

			// show controller event in panel
			var pb = this.multicontroller.find("#panel [event=" + event + "]").addClass("hit");
			setTimeout(function() {
				pb.removeClass("hit");
			}, 450);

			if(this.current) {
				this.current.handleControllerEvent(event);
			}
		}
	},

};

// (interval)
setInterval(function() {

	framework.common.statusBar.clock._update();

}, 500);


