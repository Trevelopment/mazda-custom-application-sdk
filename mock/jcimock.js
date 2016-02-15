/**
 * JCI Mock Environment
 * Simplifies local development
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-enhanced-compass)
 * Copyright (c) 2015. All rights reserved.
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

		this.showMenu();

	},

	showMenu: function() {

		if(this.current) {
			this.current.cleanUp();
		}

		this.view.fadeOut();
		this.leftButton.fadeOut();
		this.statusBar.fadeIn();

		CustomApplicationsHandler.retrieve(function(items) {


			this.menu.html("");

			this.common.statusBar.setAppName('Applications');
			this.common.statusBar.setDomainIcon(false);

            items.forEach(function(item) {

            	this.menu.append($("<a/>").attr("appId", item.appData.appId).click(this.execMenu).append(item.title));

            }.bind(this));

            // pause data handler so we an simulate it
            CustomApplicationDataHandler.pause();

            // still get the values
            CustomApplicationDataHandler.retrieve(function(data) {

            	this.setVehicleData(data);

            }.bind(this));

        }.bind(this));

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
			{name: 'Vehicle Data', mapping: VehicleData.vehicle},
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
				$.each(group.mapping, function(name, params) {

					if(params.name) {
						var tmp = CustomApplicationDataHandler.get(params.name);
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

					case "range":
						console.log(value.max);
						var editor = $("<input/>").attr({type: "range", min: value.min, max: value.max, step: value.step | 1}).val(value.value).appendTo(editorContainer),
							editorLabel = $("<span/>").addClass("inputlabel").html(value.value).appendTo(editorContainer);

						editor.on("input", function() {
							editorLabel.html($(this).val());
						});

						break;

					
					default:
						var editor = $("<input/>").val(value.value).appendTo(editorContainer);
						break;
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

};

// (interval)
setInterval(function() {

	framework.common.statusBar.clock._update();

}, 500);


