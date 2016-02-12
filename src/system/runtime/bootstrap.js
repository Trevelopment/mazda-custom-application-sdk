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

		Object.keys(application).map(function(key) {
			if(!this[key]) {
				this[key] = application[key];
			}
		}.bind(this));

	}

	CustomApplication.prototype = {

		/**
		 * Internal arrays
		 */

		storages: {},

		vehicle: {},

		images: {},

		/**
		 * (protected) __initialie
		 *
		 * Called when the application is initalized first and is reponsible for creating 
		 * the surface and canvas.
		 */
		
		/* (initialize) */
		__initialize: function(next) {

			// global specific
			this.is = CustomApplicationHelpers.is();

			// application specific
			this.settings = this.settings ? this.settings : {};

			// set loader status
			this.__loaded = false;

			// execute loader
			this.__load(function() {

				// finalize
				this.__loaded = true;

				// create surface and set some basic properties
				this.canvas = $("<div/>").addClass("CustomApplicationCanvas").attr("app", this.id);

				if(this.getSetting("backgroundColor")) {
					this.canvas.css("background-color", this.getSetting("backgroundColor"));
				}

				if(this.getSetting("textColor")) {
					this.canvas.css("color", this.getSetting("textColor"));
				}

				// finalize and bootup
				this.__created = true;

				// execute life cycle
				this.__lifecycle("created");

				// all done
				this.__initialized = true;

				// continue
				if(this.is.fn(next)) {
					next();
				}

			}.bind(this));
		},

		/**
		 * (protected) __load
		 *
		 * This loads all resources and holds the application
		 */

		__load: function(next) {

			var loaded = 0, toload = 0, isFinished = function(o) {

				CustomApplicationLog.debug(this.id, "Status update for loading resources", {loaded:loaded, toload: toload});

				var o = o === true || loaded == toload;

				if(o && this.is.fn(next)) {
					next();
				}

			}.bind(this);

			// loader

			if(this.is.object(this.require) && !this.__loaded) {

				// load javascripts
				if(this.require.js && !this.is.empty(this.require.js)) {
					toload++;
					CustomApplicationResourceLoader.loadJavascript(this.require.js, this.location, function() {
						loaded++;
						isFinished();
					});
				}

				// load css
				if(this.require.css && !this.is.empty(this.require.css)) {
					toload++;
					CustomApplicationResourceLoader.loadCSS(this.require.css, this.location, function() {
						loaded++;
						isFinished();
					});
				}

				// load images
				if(this.require.images && !this.is.empty(this.require.images)) {
					toload++;
					CustomApplicationResourceLoader.loadImages(this.require.images, this.location, function(loadedImages) {
						
						// assign images
						this.images = loadedImages;

						loaded++;
						isFinished();
					}.bind(this));
				}

				return;
			}

			isFinished(true);

		},

		/**
		 * (protected) __wakeup
		 *
		 * Wakes up the application from sleep. Called by the application handler.
		 */

		__wakeup: function(parent) {

			if(!this.__initialized) {

				return this.__initialize(function() {

					this.__wakeup(parent);

				}.bind(this));
			}

			// execute life cycle 
			this.__lifecycle("focused");

			this.canvas.appendTo(parent);
		},

		/**
		 * (protected) __sleep
		 *
		 * Puts the application in sleep mode / pauses it. Called by the application handler.
		 */

		__sleep: function() {

			this.canvas.detach();

			// execute life cycle 
			this.__lifecycle("lost");

			// end life cycle if requested
			if(this.getSetting("terminateOnLost") === true) {

				// that's it! 
				this.__terminate();
			}
			
		},

		/**
		 * (protected) __terminate
		 *
		 * Terminates an application for good. Usually only called in fatal errors.
		 */

		__terminate: function() {

			this.canvas.remove();

			this.canvas = null;

			this.__initialized = false;
		},


	    /**
	     * (protected) __handleControllerEvent
	     *
	     * Handles a event from the multi controller. 
	     */

	    __handleControllerEvent: function(eventId) {

	    	// pass to application
	    	if(this.is.fn(this.onControllerEvent)) {

	    		try {

	    			this.onControllerEvent(eventId);

	    			return true;

	    		} catch(e) {

	    		}
	    	}

	    	return false;
	    },

	    /**
	     * (protected) __lifecycle
	     *
	     * Executes a lifecycle event
	     */

	    __lifecycle: function(cycle) {

	    	try {

	    		CustomApplicationLog.info(this.id, "Executing lifecycle", {lifecycle:cycle});

	    		if(this.is.fn(this[cycle])) {
	    			this[cycle]();
	    		}

	    	} catch(e) {

	    		CustomApplicationLog.error(this.id, "Error while executing lifecycle event", {lifecycle:cycle, error: e.message});
	    	
	    	}
	    },


	    /**
		 * (internal) getters
		 */

		/**
		 * (settings)
		 */

		getSetting: function(name, _default) {
			return this.settings[name] ? this.settings[name] : (_default ? _default : false);
		},

		getId: function() {
			return this.id;
		},

		getTitle: function() {
			return this.getSetting('title');
		},

		getStatusbar: function() {
			return this.getSetting('statusbar');
		},

		getStatusbarTitle: function() {
			return this.getSetting('statusbarTitle') || this.getTitle();
		},

		getStatusbarIcon: function() {

			var icon = this.getSetting('statusbarIcon');

			if(icon === true) icon = this.location + "app.png";

			return icon;
		},

		getStatusbarHomeButton: function() {

			return this.getSetting('statusbarHideHomeButton') === true ? false : true;
		},

		getLeftButton: function() {
			return this.getSetting('leftButton');
		},

		/**
		 * (internal) observe
		 *
		 * Observes a specific vehicle data point
		 */

		observe: function(name, every, flank) {

		},

		/**
		 * (internal) forget
		 *
		 * Stops the observer for a specific vehicle data point
		 */

		forget: function(name) {

		},


    	/*
    	 * (internal) element
    	 *
    	 * creates a new jquery element and adds to the canvas
    	 */

	   	element: function(tag, id, classNames, styles, content, preventAutoAppend) {

	    	var el = $(document.createElement(tag)).attr(id ? {id: id} : {}).addClass(classNames).css(styles ? styles : {}).append(content);

	    	if(!preventAutoAppend) this.canvas.append(el);

	    	return el;
	    },

	    /**
	     * Transform Vehicle Data
	     */
	
	};

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
		{table: 'gps', enabled: true, filter: 'gps'},
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
		var loaded = 0, toload = 0, buffer = [], finish = function() {

			if(loaded >= toload) {
				this.process(buffer);
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

					console.log(data);

				}.bind(this));
			}
		}.bind(this));


/*			data = $.trim(data);
// Revised for using speed from smdb-read as it is in 0.01 KPH increments
			if ($.isNumeric(data)) {
				data = data * 0.01;
				// Cutoff under 1KPH
				if (data < 1.0) {
					data = 0;
				}
			}
			if ($.isNumeric(data) && isEnglish) {
				data = data * 0.6213712;
			}
			if ($.isNumeric(data) && data != speedValue) {
				speedValue = data;
				var speedTemp = Math.round(data);
				if(speedTemp > 0){
					updateSpeedTop(speedTemp);
					updateSpeedAvg(speedTemp);
				}
				$('#speedCurrent').each(function () {
					var $this = $(this);
					$({Counter: $this.text()}).animate({Counter: speedValue}, {
						duration: 950,
						easing: 'linear',
						step: function (now) {
							$this.text(Math.round(now));
							speedCurrent = $this.text();
							updateSpeedIndicator(speedCurrent);
						},
						complete: function () {
						}
					});
				});
			}
		});*/



		
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
					case this.array(o) || this.string(o): 
						return o.length === 0; 

					case this.object(o): 
						var s = 0;
						for(var key in o) 
							if(o.hasOwnProperty(key)) s++;
						return s === 0;
				
					case this.boolean(o):
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

		/*
		if(!this.divDebug) {
			this.divDebug = document.createElement("div");
			this.divDebug.style.position = "absolute";
			this.divDebug.style.zIndex = 999999;
			this.divDebug.style.top = "0px";
			this.divDebug.style.right = "0px";
			this.divDebug.style.backgroundColor = "red";
			this.divDebug.style.color = "white";
			this.divDebug.style.fontSize = "12px";
			document.body.appendChild(this.divDebug);
		}

		var logMsg = document.createElement("div");
		logMsg.innerHTML = msg.join(" ");
		this.divDebug.appendChild(logMsg);*/
		
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
	 * (loadImages)
	 */

	loadImages: function(images, path, callback, async) {

		this.__loadInvoker(images, path, function(filename, next, id) {
			var img = document.createElement('img');
			img.onload = function() {

				if(async) {
					var result = false;
					if(id) {
						result = {};
						result[id] = this;
					}
					callback(id ? result : this);
				} else {
					next(this);
				}
			} 
			img.src = filename;
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

		var ids = false, result = false;

		// support for arrays and objects 
		if(CustomApplicationHelpers.is().object(items)) {

			var idsObject = items, ids = [], items = [];

			Object.keys(idsObject).map(function(key) {
				ids.push(key);
				items.push(idsObject[key]);
			});

			// return as object
			result = {};
		
		} else {

			if(!CustomApplicationHelpers.is().array(items)) items = [items];
		}

		// loaded handler
		var loaded = 0, next = function() {
			loaded++;
			if(loaded >= items.length) {
				if(CustomApplicationHelpers.is().fn(callback)) {
					callback(result);
				}
			}
		};

		// process items
		items.forEach(function(filename, index) {

			filename = path + filename;

			CustomApplicationLog.debug(this.__name, "Attempting to load resource from", filename);

			build(filename, function(resource) {

				CustomApplicationLog.info(this.__name, "Successfully loaded resource", filename);

				if(resource && ids != false) {
					CustomApplicationLog.debug(this.__name, "Loaded resource assigned to id", {id: ids[index], filename: filename});	
					
					result[ids[index]] = resource;
				}

	        	if(async) {
	        		if(CustomApplicationHelpers.is().fn(callback)) callback();
	        	} else {
	        		next();
	        	}
	        }.bind(this), ids ? ids[index] : false);
		    
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
		framework: 'apps/system/custom/runtime/',
		applications: 'apps/system/custom/apps/', 
		library: 'apps/system/custom/runtime/library/'
	},

	/**
	 * (Mapping)
	 */

	mapping: {


	},

	/**
	 * (initialize) Initializes some of the core objects
	 */

	initialize: function() {

		this.initialized = true;

	},


	/**
	 * (Retrieve) loads the current application list and returns the additional items
	 */

	retrieve: function(callback) {

		try {
			// initialize
			if(!this.initialized) this.initialize();

			// load libraries

			CustomApplicationResourceLoader.loadJavascript("jquery.js", this.paths.library, function() {

				CustomApplicationResourceLoader.loadCSS("bootstrap.css", this.paths.framework, function() {

					CustomApplicationResourceLoader.loadJavascript("apps.js", this.paths.applications, function() {

						// this has been completed
						if(typeof(CustomApplications) != "undefined") {
	
							// load applications
							CustomApplicationResourceLoader.loadJavascript(
								CustomApplicationResourceLoader.fromFormatted("{0}/app.js", CustomApplications),
								this.paths.applications,
								function() {
									// all applications are loaded, run data
									CustomApplicationDataHandler.initialize();

									// create menu items
									callback(this.getMenuItems());
								}.bind(this)
							);
						}

					}.bind(this));

				}.bind(this)); // bootstrap css

			}.bind(this)); // jquery library

		} catch(e) {

			// error message
			CustomApplicationLog.error(this.__name, "Error while retrieving applications", e);

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

		application.location = this.paths.applications + id + "/";

		application.__initialize();

		this.applications[id] = application;
		
		return true;
	},

	/**
	 * (run) runs an application
	 */

	run: function(id) {

		CustomApplicationLog.info(this.__name, "Run request for application", {id: id});		

		if(CustomApplicationHelpers.is().object(id)) {

			id = id.appId ? id.appId : false;
		}

		if(this.applications[id]) {

			this.currentApplicationId = id;

			CustomApplicationLog.info(this.__name, "Preparing application launch", {id: id});

			if(typeof(framework) != "undefined") {

				var list = framework._focusStack;

				list.unshift({id: "system"});

				// send message to framework to launch application
				framework.routeMmuiMsg({"msgType":"transition","enabled":true});
				framework.routeMmuiMsg({"msgType":"ctxtChg","ctxtId":"CustomApplicationSurface","uiaId":"system","contextSeq":2})
				framework.routeMmuiMsg({"msgType":"focusStack","appIdList": list});
				framework.routeMmuiMsg({"msgType":"transition","enabled":false});

				return true;

			}

			CustomApplicationLog.error(this.__name, "Failed to launch application because framework is not available", {id: id});

			return false;
		
		}

		CustomApplicationLog.error(this.__name, "Application was not registered", {id: id});

		return false;
	},

	/**
	 * (sleep) sleeps an application
	 */

	sleep: function(application) {

		if(application.id == this.currentApplicationId) {
			this.currentApplicationId = false;
		}

		application.__sleep();
	},


	/**
	 * (getCurrentApplication) returns the current application
	 */

	getCurrentApplication: function() {

		if(this.currentApplicationId) {

			CustomApplicationLog.debug(this.__name, "Invoking current set application", {id: this.currentApplicationId});

			if(this.applications[this.currentApplicationId]) {

				return this.applications[this.currentApplicationId];
			}

			CustomApplicationLog.error(this.__name, "Application was not registered", {id: this.currentApplicationId});

			return false;
		}


		CustomApplicationLog.error(this.__name, "Missing currentApplicationId");

		return false;
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
					appName : 'custom_' + application.getId(), 
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
