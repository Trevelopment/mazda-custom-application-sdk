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

			// create surface
			this.surface = $("<div/>").addClass("CustomApplicationSurface").hide().appendTo('body');

			if(backgroundColor = this.getSetting("backgroundColor"))
				this.surface.css("backgroundColor", backgroundColor);

			if(textColor = this.getSetting("textColor"))
				this.surface.css("color", textColor);

			if(this.getSetting('statusbar'))
				this.setStatusbar(true);

			// create canvas
			this.canvas = $("<div/>").addClass("CustomApplicationCanvas").appendTo(this.surface);

			this.__extendApplication();

			this.__created = true;

			if(this.is.fn(this.application.created)) {
				this.application.created();
			}
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

			if(this.is.fn(this.application.render)) {
				this.application.render();
			}

			this.surface.addClass("visible").show();
		},


		/**
		 * (sleep)
		 */

		sleep: function(finish) {

			this.surface.removeClass("visible");

			setTimeout(function() {
				this.surface.hide();

				if(this.is.fn(finish)) finish();

			}.bind(this), 950);
		},


		/**
		 * (terminate)
		 */

		terminate: function() {

			this.sleep(function() {

				this.surface.remove();

				this.__initialized = false;

				this.__created = false;

			}.bind(this));
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

	    /**
	     * element
	     */

	    __extendApplication: function() {

	    	var that = this;

	    	this.application.element = function(tag, id, classNames, styles) {

		    	var el = $(document.createElement(tag)).attr("id", id).addClass(classNames).css(styles ? styles : {});

		    	that.canvas.append(el);

		    	return el;
		    };

	    },

	    /**
	     * MultiController
	     */

	    handleControllerEvent: function(eventId) {

	    	var result = true;

	    	if(this.is.fn(this.application.controllerEvent)) {

	    		result = this.application.controllerEvent(eventId);

	    		if(result === false) result = false;
	    	}

	    	return result;

	    },
		
	}

	return CustomApplication;
})();