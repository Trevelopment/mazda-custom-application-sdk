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


		/**
		 * (arrays)
		 */

		storages: {},

		subscriptions: {},

		images: {},

		/**
		 * (protected) __initialize
		 *
		 * Called when the application is initalized first and is reponsible for creating 
		 * the surface and canvas.
		 */
		
		/* (initialize) */
		__initialize: function(next) {

			// global specific
			this.is = CustomApplicationHelpers.is();
			this.sprintr = CustomApplicationHelpers.sprintr;

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
	     * (protected) __notify
	     *
	     * Called by the data handler to update the current vehicle data of the application
	     */

	    __notify: function(id, payload) {

	    	if(this.subscriptions[id]) {

	    		var subscription = this.subscriptions[id], notify = false;

	    		// parse type
	    		switch(subscription.type) {

	    			case this.CHANGED: 

	    				notify = subscription.changed; 
	    				break;

	    			case this.GREATER:

	    				notify = subscription.value > subscription.previous; 
	    				break;

	    			case this.LESSER:

	    				notify = subscription.value < subscription.previous; 
	    				break;

	    			case this.EQUAL:

	    				notify = subscription.value == subscription.previous; 
	    				break;

	 	    		default:

	    				notify = true;
	    				break;

	    		}

	    		// execute
	    		if(notify) {
	    			subscription.callback(payload.value, payload);
	    		}
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
		 * (internal) subscribe
		 *
		 * Observes a specific vehicle data point
		 */

		subscribe: function(name, callback, type) {

			if(this.is.fn(callback)) {

				this.subscriptions[name] = {
					type: type || this.ANY,
					callback: callback
				};
			}

		},

		/**
		 * (internal) unsubscribe
		 *
		 * Stops the observer for a specific vehicle data point
		 */

		unsubscribe: function(name) {

			this.subscriptions[name] = false;
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