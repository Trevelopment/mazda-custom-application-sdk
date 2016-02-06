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
 * HelloWorld Application
 * 
 * This is the main file of the application and contains the required information
 * to run the application on the mini framework.
 * 
 * The filename needs to be application.js in order to be recognized by the loader.
 */

CustomApplicationsHandler.register("app.helloworld", new CustomApplication({

	/**
	 * (require)
	 *
	 * An object array that defines resources to be loaded such as javascript's, css's, images, etc
	 *
	 * All resources are relative to the applications root path
	 */

	require: {

		/**
		 * (js) defines javascript includes
		 */

		js: [],

		/**
		 * (css) defines css includes
		 */

		css: [],

		/**
		 * (images) defines images
		 */

		images: [],
	},

	/**
	 * (settings)
	 *
	 * An object that defines application settings
	 */

	settings: {

		/**
		 * (title) The title of the application in the Application menu
		 */

		title: 'Hello World Application',

		/**
		 * (statusbar) Defines if the statusbar should be shown
		 */

		statusbar: false,

		/**
		 * (backgroundColor) Defines the background color of the application
		 */

		backgroundColor: "#222222",

		/**
		 * (textColor) Defines the text color of the application
		 */

		textColor: "#FFFFFF"

	},

	/**
	 * (initialize) 
	 * 
	 * This is the constructor that is called when the application is created
	 */

	initialize: function() {

	},

	/** 
	 * (render) 
	 * 
	 * Executed the first time the application gets selected from the menu
	 *
	 * Add any content that will be static here
	 */

	render: function() {

		// Canvas is a jQuery object that defines the main application window
		this.canvas.append($("<div>").append("Hello World"));
	},

	/**
	 * (execute)
	 *
	 * Executes when the application gets the focus. You can either use this event to
	 * build the application or use the render() method to predefine the canvas and use
	 * this method to run your logic.
	 */

	execute: function() {


	}

})); /** EOF **/
