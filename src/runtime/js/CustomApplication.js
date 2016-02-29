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
		 * (constants)
		 */

		ANY: 0,
		CHANGED: 1,
		GREATER: 2,
		LESSER: 3,
		EQUAL: 4,

		FOCUSED: 'focused',
		LOST: 'lost',

		/**
		 * __storage
		 */

		__storage: {},

		/**
		 * __context
		 */

		__contextCounter: 0,
		__currentContextIndex: false,

		/**
		 * (log) helper function for logging
		 */

		log: {

			__logId: false,

			__toArray: function(args) {
				var result = Array.apply(null, args);

				result.unshift(this.__logId);

				return result;
			},

			// debug
			debug: function() {
				CustomApplicationLog.debug.apply(CustomApplicationLog, this.__toArray(arguments));
			},

			// info
			info: function() {
				CustomApplicationLog.info.apply(CustomApplicationLog, this.__toArray(arguments));
			},

			// error
			error: function() {
				CustomApplicationLog.error.apply(CustomApplicationLog, this.__toArray(arguments));
			},
		},


		/**
		 * (protected) __initialize
		 *
		 * Called when the application is initalized first and is reponsible for creating
		 * the surface and canvas.
		 */

		/* (initialize) */
		__initialize: function(next) {

			var that = this;

			// assign version
			this.__version = CUSTOM_APPLICATION_VERSION;

			// data arrays
			this.__subscriptions = {};

			// initialize context
			this.__contexts = [];

			// set id
			this.log.__logId = this.id;

			// global specific
			this.is = CustomApplicationHelpers.is();
			this.sprintr = CustomApplicationHelpers.sprintr;

			// application specific
			this.settings = this.settings ? this.settings : {};

			// register application subscriptions
			this.subscribe(VehicleData.general.region, function(value, payload) {

				this.setRegion(value);

			}.bind(this), this.CHANGED);

			this.__region = CustomApplicationDataHandler.get(VehicleData.general.region, 'na').value;

			// set loader status
			this.__loaded = false;

			// execute loader
			this.__load(function() {

				// finalize
				this.__loaded = true;

				// create surface and set some basic properties
				this.canvas = $("<div/>").addClass("CustomApplicationCanvas").attr("app", this.id);

				// assign default event for context fields
				this.canvas.on("click touchend", "[contextIndex]", function() {

					that.__setCurrentContext($(this).attr("contextIndex"));

				});

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

				this.log.debug("Status update for loading resources", {loaded:loaded, toload: toload});

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

			// read storage
			this.__getstorage();

			// execute life cycle
			this.__lifecycle("focused");

			// add to canvas
			this.canvas.appendTo(parent);

			// measure context
			setTimeout(function() {
				this.__measureContext();
			}.bind(this), 25);
		},

		/**
		 * (protected) __sleep
		 *
		 * Puts the application in sleep mode / pauses it. Called by the application handler.
		 */

		__sleep: function() {

			// clear canvas
			if(this.canvas) {
				this.canvas.detach();
			}

			// write storage
			this.__setstorage();

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

	    	// log
	    	this.log.info("Received Multicontroller Event", {eventId:eventId});

	    	// process to context
	    	if(this.__processContext(eventId)) return true;

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

	    		this.log.info("Executing lifecycle", {lifecycle:cycle});

	    		if(this.is.fn(this[cycle])) {
	    			this[cycle]();
	    		}

	    	} catch(e) {

	    		this.log.error("Error while executing lifecycle event", {lifecycle:cycle, error: e.message});

	    	}
	    },

	    /**
	     * (protected) __notify
	     *
	     * Called by the data handler to update the current vehicle data of the application
	     */

	    __notify: function(id, payload) {

	    	id = id.toLowerCase();

	    	if(this.__subscriptions[id]) {

	    		var subscription = this.__subscriptions[id], notify = false;

	    		// parse type
	    		switch(subscription.type) {

	    			case this.CHANGED:
	    				notify = payload.changed;
	    				break;

	    			case this.GREATER:

	    				notify = payload.value > payload.previous;
	    				break;

	    			case this.LESSER:

	    				notify = payload.value < payload.previous;
	    				break;

	    			case this.EQUAL:

	    				notify = payload.value == payload.previous;
	    				break;

	 	    		default:

	    				notify = true;
	    				break;

	    		}

	    		// execute
	    		if(notify) {
	    			subscription.callback(payload.value, $.extend({},
	    				this.__subscriptions[id],
	    				payload
	    			));
	    		}
	   		}
	    },


	    /**
		 * (internal) getters
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

		getHasLeftButton: function() {
			return this.getSetting('hasLeftButton');
		},

		getHasRightArc: function() {
			return this.getSetting('hasRightArc');
		},

		getHasMenuCaret: function() {
			return this.getSetting('hasMenuCaret');
		},

		getRegion: function() {
			return this.__region || 'na';
		},

		getStorage: function() {
			return this.__storage;
		},

		/**
		 * (internal) setters
		 */

		setRegion: function(region) {

			if(this.__region != region) {
				this.__region = region;

				if(this.is.fn(this.onRegionChange)) {
					this.onRegionChange(region);
				}
			}
		},

		/**
		 * (internal) storage
		 *
		 * Storage specific methods - this needs to be finalized
		 */

		get: function(name, _default) {
			return this.is.defined(this.__storage[name]) ? this.__storage[name] : _default;
		},

		__getstorage: function() {

			try {
				this.__storage = JSON.parse(localStorage.getItem(this.getId()));
			} catch(e) {
			}
		},

		set: function(name, value) {
			this.__storage[name] = value;

			this.__setstorage();
		},

		__setstorage: function() {

			try {
				// local storage should work on all mazda systems
				localStorage.setItem(this.getId(), JSON.stringify(this.__storage));
			} catch(e) {
				this.log.info("Could not set storage", {message: e.message});
			}
		},

		/**
		 * (internal) subscribe
		 *
		 * Observes a specific vehicle data point
		 */

		subscribe: function(id, callback, type) {

			if(this.is.fn(callback)) {

				var o = {};
				if(this.is.object(id)) {
					o = id;
					id = o.id || false;
				}

				if(id) {
					// set all lowercase id
					id = id.toLowerCase();

					// register subscription
					this.__subscriptions[id] = $.extend({}, o, {
						id: id,
						type: type || this.CHANGED,
						callback: callback
					});

					// all set
					return true;
				}
			}

			return false;
		},

		/**
		 * (internal) unsubscribe
		 *
		 * Stops the observer for a specific vehicle data point
		 */

		unsubscribe: function(id) {

			id = id.toLowerCase();

			if(this.__subscriptions[id]) {
				this.__subscriptions[id] = false;
			}
		},

		/**
		 * (internal) removeSubscriptions
		 *
		 * Removes all subscriptions
		 */

		removeSubscriptions: function() {

			this.__subscriptions = {} // clear all
		},

		/**
		 * (internal) transformValue
		 *
		 * Calls a DataTransform object
		 */

		transformValue: function(value, transformer) {

			return this.is.fn(transformer) ? transformer(value) : value;

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
	     * (internal) addContext
	     *
	     * Adds a new context to the context table
	     */

	    addContext: function(context, callback) {

	    	// format context
	    	switch(true) {

	    		case context.nodeName:

	    			context = $(content);

	    			break;

	    		case (context instanceof jQuery):

	    			break;

	    		default:

	    			return false;
	    	}

	    	// add element
	    	context.attr("contextIndex", this.__contextCounter || 0);

	    	// register into context
	    	this.__contexts.push({
	    		index: this.__contextCounter,
	    		callback: callback
	    	});

	    	// update counter
	    	this.__contextCounter += 1;

	    	// return context which is the actual dom element
	    	return context;
	    },

	    /**
	     * (protected) __measureContext
	     *
	     * Internal function to measure all contextes
	     */

	    __measureContext: function() {

	    	$.each(this.__contexts, function(index, context) {

	    		// get target
	    		var target = this.canvas.find(this.sprintr("[contextIndex={0}]", context.index));

	    		// sanity check
	    		if(!target.length) return false;

	    		// measure
	    		this.__contexts[index] = $.extend({}, this.__contexts[index], {
	    			boundingBox: $.extend({}, target.offset(), {
		    			width: target.outerWidth(),
		    			height: target.outerHeight(),
		    			bottom: target.offset().top + target.outerHeight(),
		    			right: target.offset().left + target.outerWidth()
		    		}),
	    			enabled: true,
	    		});

	    		var bb = this.__contexts[index].boundingBox;

	    		$.each(this.__contexts, function(intersectIndex, intersectContext) {

	    			if(intersectIndex != index && intersectContext.boundingBox) {

	    				var ib = intersectContext.boundingBox;

	    				if(bb.left <= ib.right && ib.left <= bb.right && bb.top <= ib.bottom && ib.top <= bb.bottom) {

	    					this.__contexts[index].enabled = false;

	    					return false;
	    				}
	    			}

	    		}.bind(this));

	    	}.bind(this));

	    	// set initial index
	    	if(this.__currentContextIndex === false && this.__contexts.length) {
	    		this.__setCurrentContext(this.__contexts[0].index); // first item
	    	}

	    },

	    /**
	     * (protected) __processContext
	     *
	     * processes the current context
	     */

	    __processContext: function(eventId, rms) {

	    	// sanity check
	    	if(!this.__contexts.length || this.__currentContextIndex === false) return false;

	    	// log
	    	this.log.debug("Context received new event", {eventId: eventId, index: this.__currentContextIndex});

	    	// process direction
	    	var nextIndex = false,
	    		lastDistance = false,
	    		current = this.__contexts[this.__currentContextIndex],
	    		ba = current.boundingBox,
	    		calc = function(i, o, index, r) {
	    			var d = r ? i - o : o - i;
	    			if(d >= 0 && (lastDistance === false || d < lastDistance)) {
	    				lastDistance = d;
	    				nextIndex = index;
	    			}
	    		};

	    	$.each(this.__contexts, function(index, context) {

	    		// make sure we don't process ourselves
	    		if(index != this.__currentContextIndex) {

	    			var bb = context.boundingBox;

	    			if(ba && bb) {

			    		// process by eventId and find next item
				    	switch(eventId) {

				    		case "rightStart":
				    			calc(ba.right, bb.left, index);
				    			break;

				    		case "leftStart":
				    			calc(ba.left, bb.right, index, true);
				    			break;

				    		case "upStart":
				    			calc(ba.top, bb.bottom, index, true);
				    			break;

				    		case "downStart":
				    			calc(ba.bottom, bb.top, index);
				    			break;

				    	}
				    }
			    }

		    }.bind(this));


		    // finalize
		    if(nextIndex !== false) {
		    	this.__setCurrentContext(nextIndex);

		    	return true;
		    }

		    return false;
	    },


	    /**
	     * (protected) __setCurrentContext
	     *
	     * sets the current index
	     */

	    __setCurrentContext: function(index) {

	    	// get generic
	    	var hasEventHandler = this.is.fn(this.onContextEvent);

	    	// execute application event
	    	if(this.__currentContextIndex !== false) {

	    		var last = this.__contexts[this.__currentContextIndex],
	    			target =  this.canvas.find(this.sprintr("[contextIndex={0}]", this.__currentContextIndex));

	    		if(last && target.length) {

	    			var result = false;

		    		// send callback
		    		if(this.is.fn(last.callback)) {
		    			// lost focus
		    			result = last.callback.call(this, this.LOST, last, target);
		    		}

		    		// notify
		    		if(!result && hasEventHandler) {
		    			this.onContextEvent(this.LOST, last, target);
		    		}

		    		// log
		    		this.log.info("Context lost focus", {contextIndex: last.index});
		    	}
		    }

		    // process new context
			this.canvas.find("[context]").attr("context", "lost");

		   	// get new target
		   	var target = this.canvas.find(this.sprintr("[contextIndex={0}]", index)),
		   	    current = this.__contexts[index];



		   	// notify callback
		   	if(current && target.length) {

		   	  	// set target focus
		   		target.attr("context", "focused");

		   		var result  = false;

	    		// send callback
	    		if(this.is.fn(current.callback)) {
	    			// lost focus
	    			result = current.callback.call(this, this.FOCUSED, current, target);

	    		}

	    		// notify
	    		if(!result && hasEventHandler) {
	    			this.onContextEvent(this.FOCUSED, current, target);
	    		}

	    		// log
		    	this.log.info("Context gained focus", {contextIndex: current.index});
	    	}

	    	// set current context
	    	this.__currentContextIndex = index;
	    },

	};

	return CustomApplication;

})();