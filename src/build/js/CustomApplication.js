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

		this.__initialize();
	};

	CustomApplication.prototype = {

		storages: {},

		vehicle: {},

		/**
		 * (protected) __initialie
		 *
		 * Called when the application is initalized first and is reponsible for creating 
		 * the surface and canvas.
		 */
		
		/* (initialize) */
		__initialize: function() {

			// global specific
			this.is = CustomApplicationHelpers.is();

			// application specific
			this.settings = this.settings ? this.settings : {};

			// create surface
			this.canvas = $("<div/>").addClass("CustomApplicationCanvas");

			if(backgroundColor = this.getSetting("backgroundColor"))
				this.canvas.css("background-color", backgroundColor);

			if(textColor = this.getSetting("textColor"))
				this.canvas.css("color", textColor);

			// finalize and bootup
			this.__created = true;

			// execute life cycle
			if(this.is.fn(this.created)) {
				this.created();
			}
		},

		/**
		 * (protected) __wakeup
		 *
		 * Wakes up the application from sleep. Called by the application handler.
		 */

		__wakeup: function(parent) {

			if(!this.__initialized) {

				if(this.is.fn(this.initialize)) {
					this.initialize();
				}

				this.__initialized = true;
			}

			// execute life cycle 
			if(this.is.fn(this.focused)) {
				this.focused();
			}

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
			if(this.is.fn(this.lost)) {
				this.lost();
			}

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

	    		this.onControllerEvent(eventId);

	    		return true;
	    	}

	    	return false;
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

			return this.getSetting('statusbarHomeButton');
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

	   	element: function(tag, id, classNames, styles) {

	    	var el = $(document.createElement(tag)).attr("id", id).addClass(classNames).css(styles ? styles : {});

	    	this.canvas.append(el);

	    	return el;
	    },

	    /**
	     * Transform Vehicle Data
	     */


		
	}

	return CustomApplication;
})();