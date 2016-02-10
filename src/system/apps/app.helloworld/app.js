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
 * The filename needs to be app.js in order to be recognized by the loader.
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
		 * (terminateOnLost) 	
		 * 
		 * If set to 'true' this will remove the stateless life cycle and always
		 * recreate the application once the focus is lost. Otherwise by default
		 * the inital created state will stay alive across the systems runtime.
		 *
		 * Default is false or not set
		 * /

		// terminateOnLost: false, 

		/**
		 * (title) The title of the application in the Application menu
		 */

		title: 'Hello World',

		/**
		 * (statusbar) Defines if the statusbar should be shown
		 */

		statusbar: true,

		/**
		 * (statusbarIcon) defines the status bar icon
		 * 
		 * Set to true to display the default icon app.png or set a string to display
		 * a fully custom icon.
		 *
		 * Icons need to be 37x37
		 */

		statusbarIcon: true,

		/**
		 * (statusbarTitle) overrides the statusbar title, otherwise title is used
		 */

		statusbarTitle: false,

		/**
		 * (statusbarHomeButton) hides the home button in the statusbar 
		 *
		 * By default this is disabled
		 */

		// statusbarHomeButton: false,

		/**
		 * (leftButton) indicates if the UI left button / return button should be shown
		 */

		leftButton: false,

		/**
		 * (backgroundColor) Defines the background color of the application
		 */

		backgroundColor: "#222222",

		/**
		 * (textColor) Defines the text color of the application
		 */

		textColor: "#FFFFFF",

	},


	/***
	 *** Constructor
	 ***/

	/**
	 * (initialize) 
	 * 
	 * This is the constructor that is called when the application is created
	 */

	initialize: function() {



	},


	/***
	 *** User Interface Life Cycles
	 ***/

	/** 
	 * (created) 
	 * 
	 * Executed the first time the application gets selected from the menu
	 *
	 * Add any content that will be static here
	 */

	created: function() {

		// Elements returns a jQuery object

		this.label = this.element("div", false, false, {
			position: 'absolute',
			top: 10, 
			left: 10,
		});

		this.label.html("Waiting for Element");

		this.info = this.element("div", false, false, {
			position: 'absolute',
			top:50,
			left: 10
		});

		this.info.html("Vehicle Speed");

		//console.log(this.vehicle.speed);


		//this.log(this.transform(this.vehicle.speed, this.transform.toMPH));

	},

	/**
	 * (focused)
	 *
	 * Executes when the application gets the focus. You can either use this event to
	 * build the application or use the created() method to predefine the canvas and use
	 * this method to run your logic.
	 */

	focused: function() {


	},


	/**
	 * (lost)
	 *
	 * Lost is executed when the application looses it's context. You can specify any
	 * logic that you want to run before the application gets removed from the DOM.
	 *
	 * If you enabled terminateOnLost you may want to save the state of your app here.
	 */
	
	lost: function() {

	},

	/***
	 *** Events
	 ***/

	/**
	 * (event) onControllerEvent
	 *
	 * Called when a new (multi)controller event is available 
	 */

	onControllerEvent: function(eventId) {

		this.label.html(eventId);

	},


})); /** EOF **/
