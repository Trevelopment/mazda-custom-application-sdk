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
 * (CustomApplication)
 *
 * The main class for applications
 */

var CustomApplication = (function(){

	function CustomApplication(application) {

		this.application = application;
		
		this.__initialize();
	};

	CustomApplication.prototype = {

		storages: {},
		
		/* (initialize) */
		__initialize: function() {

			this.is = CustomApplicationHelpers.is();
			
			this.canvas = document.createElement("div");
			this.canvas.classList.add("CustomApplicationCanvas");
			this.canvas.style.display = "none";

			if(backgroundColor = this.getSetting("backgroundColor"))
				this.canvas.style.backgroundColor = backgroundColor;

			if(textColor = this.getSetting("textColor"))
				this.canvas.style.color = textColor;

			if(this.getSetting('statusbar'))
				this.setStatusbar(true);

			document.body.appendChild(this.canvas);

			this.__created = true;
		},

		/** 
		 * (wakeup)
		 */

		wakeup: function() {

			if(!this.__initialized) {

				if(this.is.fn(this.application.initialize)) {
					this.application.initialize();
				}

				this.__initialized = false;
			}

			this.canvas.style.display = "block";
			this.canvas.classList.add("visible");

		},


		/**
		 * (sleep)
		 */

		sleep: function() {

			this.canvas.classList.remove("visible");

			setTimeout(function() {
				this.canvas.style.display = "none";
			}.bind(this), 950);
		},


		/**
		 * (terminate)
		 */

		terminate: function() {

			this.sleep();

			document.body.removeChild(this.canvas);

			this.__initialized = false;

			this.__created = false;
		},

		/**
		 * (settings)
		 */

		getSetting: function(name, _default) {
			return this.application.settings[name] ? this.application.settings[name] : (_default ? _default : false);
		},

		/**
		 * (getters)
		 */

		getId: function() {
			return this.id;
		},

		getTitle: function() {
			return this.getSetting('title');
		},

		/**
		 * (setters)
		 */

		setStatusbar: function(visible)  {
			if(visible) {
				this.canvas.classList.add("withStatusBar");
			} else {
				this.canvas.classList.remove("withStatusBar");
			}
		},
		
	}

	return CustomApplication;
})();
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
 * (CustomApplicationHelpers)
 *
 * A abstract collection of helpers for the framework
 */

var CustomApplicationHelpers = {

	/**
	 * (is) a implemention of the flyandi:is library
	 */

	is: function() {

		return {

			undefined: 'undefined',

			__toString: function() {
				return Object.prototype.toString.call(arguments[0]);
			},

			/** (iterable) */
			iterable: function() {
				return this.object(arguments[0]) || this.array(arguments[0]);
			},

			/** (fn) */
			fn: function() {
				return typeof(arguments[0]) == "function";
			},

			/** (object) */
			object: function() {
				return typeof(arguments[0]) == "object";
			},

			/** (array) */
			array: function() {
				return this.__toString(arguments[0]) === '[object Array]';
			},

			/** (date) */
			date: function() {
				return this.__toString(arguments[0])  === '[object Date]';
			},

			/** (string) */
			string: function() {
				return typeof(arguments[0]) == "string";
			},

			/** (number) */
			number: function() {
				return typeof(arguments[0]) == "number";
			},

			/** (boolean) */
			boolean: function() {
				return typeof(arguments[0]) == "boolean";
			},

			/** (defined) */
			defined: function() {
				return typeof(arguments[0]) != Is.undefined;
			},

			/** (element) */
			element: function() {
				return typeof(HTMLElement) !== Is.undefined ? (arguments[0] instanceof HTMLElement) : (arguments[0] && arguments[0].nodeType === 1);
			},

			/** (empty) */
			empty: function(o) {
				switch(true) {
					case Is.array(o) || Is.string(o): 
						return o.length === 0; 

					case Is.object(o): 
						var s = 0;
						for(var key in o) 
							if(o.hasOwnProperty(key)) s++;
						return s === 0;
				
					case Is.boolean(o):
						return o === false;

					default:
						return !o;
				}
			},

			/** (same) */
			same: function(a, b) {
				return a == b;
			},
		};
	},

	/**
	 * (iterate) a iterate that supports arrays and objects
	 */

	iterate: function(o, item) {

		if(this.is().object(o)) {
			return Object.keys(o).map(function(key) {
				return item(key, o[key], true);
			});
		} else if (this.is().array(o)) {
			return o.map(function(value, key) {
				return item(key, value);
			});
		}
	},

	/**
	 * (sprintr) (https://gist.github.com/flyandi/395816232c70de327801)
	 */

	sprintr: function() {
		var 
			args = Array.prototype.slice.call(arguments),
			subject = arguments[0];

		args.shift();

		for(var i = 0; i < args.length; i++) 
			subject = subject.split("{" + i + "}").join(args[i]);

		return subject;
	},

};





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
 * (CustomApplicationLog)
 *
 * A logger
 */

var CustomApplicationLog = {

	levels: {
		debug: 'DEBUG',
		info: 'INFO',
		error: 'ERROR',
	},

	/**
	 * (debug) debug message
	 */

	debug: function() {
		this.__message(this.levels.debug, "#006600", Array.apply(null, arguments));
	},

	/**
	 * (error) error message
	 */

	error: function() {
		this.__message(this.levels.debug, "#FF0000", Array.apply(null, arguments));
	},

	/**
	 * (info) info message
	 */

	info: function() {
		this.__message(this.levels.debug, "#0000FF", Array.apply(null, arguments));
	},

	/**
	 * (message)
	 */

	__message: function(level, color, values) {

		var msg = [];
		if(values.length > 1) {
			values.forEach(function(value, index) {

				if(index > 0) {

					switch(true) {

						case CustomApplicationHelpers.is().iterable(value):

							CustomApplicationHelpers.iterate(value, function(key, value, obj) {

								msg.push(obj ? CustomApplicationHelpers.sprintr("[{0}={1}]", key, value) : CustomApplicationHelpers.sprintr("[{0}]", value));

							});
							break;

						default:
							msg.push(value);
							break;
					}
				}

			});
		}

		console.log(
			CustomApplicationHelpers.sprintr("%c[{0}] [{1}] ", (new Date()).toDateString(), values[0]) +
			CustomApplicationHelpers.sprintr("%c{0}", msg.join(" ")), 
			"color:black",
			CustomApplicationHelpers.sprintr("color:{0}", color)
		);
	}

};





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
 * (CustomApplicationResourceLoader)
 *
 * The resource loader for applications
 */

var CustomApplicationResourceLoader = {

	__name: 'ResourceLoader',

	/**
	 * (require) loads a resource object array
	 */

	require: function(resources, callback, async) {



	},

	/**
	 * (loadJavascript)
	 */

	loadJavascript: function(scripts, path, callback, async) {

		this.__loadInvoker(scripts, path, function(filename, next) {
			var script = document.createElement('script');
	        script.type = 'text/javascript';
	        script.src = filename;
	        script.onload = next;
	        document.body.appendChild(script);
		}, callback, async);
	},

	/**
	 * (loadCSS)
	 */

	loadCSS: function(css, path, callback, async) {

		this.__loadInvoker(css, path, function(filename, next) {
			var css = document.createElement('link');
	        css.rel = "stylesheet";
	        css.type = "text/css";
	        css.href = filename
	        css.onload = async ? callback : next;
	        document.body.appendChild(css);
		}, callback, async);
	},

	/**
	 * (fromFormatted)
	 */

	fromFormatted: function(format, items) {

		items.forEach(function(value, index) {
			items[index] = CustomApplicationHelpers.sprintr(format, value);
		});

		return items;

	},


	/**
	 * (__loadInvoker)
	 */

	__loadInvoker: function(items, path, build, callback, async) {

		if(!CustomApplicationHelpers.is().array(items)) items = [items];

		var loaded = 0, next = function() {
			loaded++;
			if(loaded >= items.length) {
				if(CustomApplicationHelpers.is().fn(callback)) {
					callback();
				}
			}
		};

		items.forEach(function(filename, index) {

			filename = path + filename;

			CustomApplicationLog.debug(this.__name, "Attempting to load resource from", filename);

			build(filename, function() {

				CustomApplicationLog.info(this.__name, "Successfully loaded resource", filename);

	        	if(async) {
	        		if(CustomApplicationHelpers.is().fn(callback)) callback();
	        	} else {
	        		next();
	        	}
	        }.bind(this));
		    
	   	}.bind(this));
	}

}

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
 * (CustomApplicationsHandler)
 *
 * This is the custom handler that manages the application between the JCI system and the mini framewor
 */

var CustomApplicationsHandler = {

	__name: 'ApplicationsHandler',

	/**
	 * (Applications) storage for applications
	 */

	applications: {},

	/**
	 * (Paths)
	 */

	paths: {
		framework: 'apps/system/custom/framework/',
		applications: 'apps/system/custom/apps/', 
	},


	/**
	 * (Retrieve) loads the current application list and returns the additional items
	 */

	retrieve: function(callback) {

		try {
			CustomApplicationResourceLoader.loadCSS("bootstrap.css", this.paths.framework);

			CustomApplicationResourceLoader.loadJavascript("apps.js", this.paths.applications, function() {

				// this has been completed
				if(typeof(CustomApplications) != "undefined") {

					// load applications
					CustomApplicationResourceLoader.loadJavascript(
						CustomApplicationResourceLoader.fromFormatted("{0}/application.js", CustomApplications),
						this.paths.applications,
						function() {
							callback(this.getMenuItems());
						}.bind(this)
					);
				}

			}.bind(this));

		} catch(e) {
			// make sure that we notify otherwise we don't get any applications
			callback(this.getMenuItems());
		}
	},

	/**
	 * (Register) registers all the custom applications
	 */

	register: function(id, application) {

		CustomApplicationLog.info(this.__name, {id:id}, "Registering application");

		application.id = id;

		this.applications[id] = application;
		
		return true;
	},


	/**
	 * (Show) shows the applicaton with the id
	 */

	show: function(id) {

		if(!id) return false;

		this.hide(this.currentApplicationId);

		CustomApplicationLog.debug(this.__name, "Request to show application", {id: id});

		if(this.applications[id]) {	

			this.currentApplicationId = id;

			this.applications[id].wakeup();

		} else {
			CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});
		}

	},

	/**
	 * (Hide) hides the application with the id
	 */

	hide: function(id) {

		if(!id) return false;

		CustomApplicationLog.debug(this.__name, "Request to hide application", {id: id});

		if(this.applications[id]) {	

			this.applications[id].sleep();

			if(this.currentApplicationId == id) {
				this.currentApplicationId = false;
			}

		} else {
			CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});
		}
	},

	/**
	 * (Destroy) destroys the application
	 */

	destroy: function(id) {

		if(!id) return false;

		CustomApplicationLog.debug(this.__name, "Request to destroy application", {id: id});

		if(this.applications[id]) {	

			this.applications[id].terminate();

			if(this.currentApplicationId == id) {
				this.currentApplicationId = false;
			}

		} else {
			CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});
		}
	},

	/**
	 * (getMenuItems) returns the items for the main application menu
	 */

	getMenuItems: function(callback) {

		return CustomApplicationHelpers.iterate(this.applications, function(id, application) {

			CustomApplicationLog.info(this.__name, {id:id}, "Adding application to menu", {
				title: application.getTitle(),
			});

			return {
				appData : { 
					appName : application.getTitle(), 
					isVisible : true, 
					mmuiEvent : 'ExecuteCustomApplication',
					appId: application.getId(),         
				}, 
				title: application.getTitle(),
				text1Id : application.getTitle(),
				disabled : false,  
				itemStyle : 'style01', 
				hasCaret : false 
			};

		}.bind(this));
	},

};

//{ appData : { appName : 'hdtrafficimage', isVisible : false, mmuiEvent : 'SelectHDTrafficImage'         }, text1Id : 'HDTrafficItem',               disabled : true,  itemStyle : 'style01', hasCaret : false },

