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
			
			this.canvas = document.createElement("div");
			this.canvas.classList.add("CustomApplicationCanvas");

			if(backgroundColor = this.getSetting("backgroundColor"))
				this.canvas.style.backgroundColor = backgroundColor;

			if(textColor = this.getSetting("textColor"))
				this.canvas.style.color = textColor;

			document.body.appendChild(this.canvas);
		},

		/**
		 * (settings)
		 */

		getSetting: function(name, _default)
		{
			return this.application.settings[name] ? this.application.settings[name] : (_default ? _default : false);
		},


		/**
		 * (attributes)
		 */

		getId: function() {
			return this.id;
		},

		getTitle: function() {
			return this.getSetting('title');
		},

		getStatusbar: function()  {
			return this.getSetting('statusbar');
		}
		
	}

	return CustomApplication;
})();