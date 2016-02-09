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
			this.__surface = $("<div/>").addClass("CustomApplicationSurface").hide().appendTo('body');

			if(backgroundColor = this.getSetting("backgroundColor"))
				this.__surface.css("backgroundColor", backgroundColor);

			if(textColor = this.getSetting("textColor"))
				this.__surface.css("color", textColor);

			if(this.getSetting('statusbar'))
				this.setStatusbar(true);

			// create canvas
			this.canvas = $("<div/>").addClass("CustomApplicationCanvas").appendTo(this.__surface);

			// finalize and bootup
			this.__created = true;

			if(this.is.fn(this.created)) {
				this.created();
			}
		},

		/**
		 * (protected) __wakeup
		 *
		 * Wakes up the application from sleep. Called by the application handler.
		 */

		__wakeup: function() {

			if(!this.__initialized) {

				if(this.is.fn(this.initialize)) {
					this.initialize();
				}

				this.__initialized = false;
			}

			if(this.is.fn(this.render)) {
				this.render();
			}

			this.__surface.addClass("visible").show();
		},

		/**
		 * (protected) __sleep
		 *
		 * Puts the application in sleep mode / pauses it. Called by the application handler.
		 */

		__sleep: function(finish) {

			this.__surface.removeClass("visible");

			setTimeout(function() {
				this.__surface.hide();

				if(this.is.fn(finish)) finish();

			}.bind(this), 950);
		},

		/**
		 * (protected) __terminate
		 *
		 * Terminates an application for good. Usually only called in fatal errors.
		 */

		__terminate: function() {

			this.sleep(function() {

				this.__surface.remove();

				this.__initialized = false;

				this.__created = false;

			}.bind(this));
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

		/**
		 * (internal) setters
		 */

		setStatusbar: function(visible)  {
			if(visible) {
				this.__surface.classList.add("withStatusBar");
			} else {
				this.__surface.classList.remove("withStatusBar");
			}
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