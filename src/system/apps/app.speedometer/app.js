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
 * Speedometer Application
 * 
 * This is an implementation of the famous Speedometer by @serezhka
 */

CustomApplicationsHandler.register("app.speedometer", new CustomApplication({

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

		css: ['app.css'],

		/**
		 * (images) defines images that are being preloaded
		 *
		 * Images are assigned to an id
		 */

		images: {

		},
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

		title: 'Speedometer',

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

		statusbarTitle: 'Speedometer',

		/**
		 * (statusbarHideHomeButton) hides the home button in the statusbar 
		 */

		// statusbarHideHomeButton: false,

		/**
		 * (leftButton) indicates if the UI left button / return button should be shown
		 */

		leftButton: false

	},

	/**
	 * Scales
	 */

	scales: {

		northamerica: {
			unit: 'mph',
			unitLabel: 'MPH',
			scaleMin: 0,	// 0  = 0mph
			scaleMax: 13,	// 12 = 120mph
			scaleStep: 10,  // every 10 miles / hour
			scaleAngle: 148, 
			scaleRadius: 170,
			scaleOffsetStep: 4.8,
			scaleOffsetX: -11,
			scaleOffsetY: 0,
			scaleWidth: 278,
			scaleHeight: 241,
		},

		europe: {
			unit: 'kmh',
			unitLabel: 'km/h',
			scaleMin: 0,	// 0  = 0mph
			scaleMax: 13,	// 12 = 120mph
			scaleStep: 20,  // every 10 miles / hour
			scaleAngle: 148, 
			scaleRadius: 170,
			scaleOffsetStep: 4.6,
			scaleOffsetX: -15,
			scaleOffsetY: 0,
			scaleWidth: 278,
			scaleHeight: 241,
		},


	},

	// default scale
	scale: false,

	/**
	 * Text Gauges
	 */

	textGauges: {



	},


	/***
	 *** User Interface Life Cycles
	 ***/

	/** 
	 * (created) 
	 * 
	 * Executed when the application gets initialized
	 *
	 * Add any content that will be static here
	 */

	created: function() {

		// set scale by default
		this.scale = this.scales.northamerica;

		// create speedometer panel
		this.speedoMeter = $("<div/>").attr("id", "speedometer").appendTo(this.canvas);

		this.speedoUnit = $("<div/>").attr("id", "speedounit").appendTo(this.speedoMeter);

		this.speedoDial = $("<div/>").attr("id", "speedodial").appendTo(this.canvas);

		this.speedoIndicator = $("<div/>").attr("id", "speedoindicator").appendTo(this.canvas);

		this.speedoCurrent = $("<div/>").attr("id", "speedocurrent").appendTo(this.canvas);

		this.speedoDialText =  $("<div/>").attr("id", "speedodialtext").appendTo(this.canvas);

		// create gps
		this.createGPSPanel();

		// create text gaugaes
		this.createTextGauges();

		// create graph plot
		this.createSpeedGraph();

		// initialize scale
		this.createSpeedoScale();

		
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

		// Look above where we create this.label
		// Here is where we assign the value!
	},

	/**
	 * (createSpeedGraph)
	 */

	createSpeedGraph: function() {

		this.speedGraph = $("<div/>").attr("id", "speedgraph").appendTo(this.canvas);	

	},

	/**
	 * (createTextGauges)
	 */

	createTextGauges: function() {

	

	},


	/**
	 * (createGPSPanel)
	 */

	createGPSPanel: function() {

		this.gpsPanel = $("<div/>").attr("id", "gps").appendTo(this.canvas)
		this.gpsCompass = $("<div/>").attr("id", "gpscompass").appendTo(this.canvas);	
		
		var rose = [];

		// create rose
		['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach(function(direction) {

			rose.push($("<div/>").addClass(direction.length == 2 ? "small" : "").append(direction).appendTo(this.gpsCompass));

		}.bind(this));

		// apply radial transformation
		this.createScaleRadial(rose, {
			scaleMin: 0,	
			scaleMax: 8,	
			scaleStep: 45,  
			scaleAngle: -90, 
			scaleRadius: 78,
			scaleOffsetStep: 0,
			scaleOffsetX: 126,
			scaleOffsetY: 132,
			scaleWidth: 179,
			scaleHeight: 179,
			scaleHalfAngle: function(angle, radian, field) {
				if(angle % 2) {
					return angle < 0 || angle == 135 ? 45 : -45
				}
			}
		});
	},

	/**
	 * (createSpeedoScale)
	 */

	createSpeedoScale: function(scale) {

		// clear main container
		this.speedoDialText.empty();

		// prepare
		var scale = scale ? scale : this.scale,
			container = $("<div/>").addClass("container").appendTo(this.speedoDialText),
			fields = [];

		// create scale			
		for(var s = scale.scaleMin; s < scale.scaleMax; s++) {
			// create scale label
			fields.push($("<div/>").addClass("speedotext").append(s * scale.scaleStep).appendTo(container));
		}

		// apply radial transformation
		this.createScaleRadial(fields, scale);

		// also update some other containers
		this.speedoUnit.html(scale.unitLabel);

		// return the container
		return container;
	},

	/**
	 * (createScaleRadial) creates a radial container
	 */

	createScaleRadial: function(fields, scale) {

		var	radius = scale.scaleRadius,
			width = scale.scaleWidth, 
			height = scale.scaleHeight,
			ox = scale.scaleOffsetX,
			oy = scale.scaleOffsetY,
			angle = scale.scaleAngle,
			radian = scale.scaleAngle * (Math.PI / 180),
			step = (2 * Math.PI) / (scale.scaleMax - scale.scaleMin + scale.scaleOffsetStep);


		fields.forEach(function(field) {

			// calculate positon
			var x = Math.round(width / 2 + radius * Math.cos(radian) - field.width()/2),
        		y = Math.round(height / 2 + radius * Math.sin(radian) - field.height()/2);

        	field.css({
        		top: oy + y,
        		left: ox + x
        	});

        	if(this.is.fn(scale.scaleHalfAngle)) {

        		var value = scale.scaleHalfAngle(angle, radian, field);

        		if(value !== false) {
        			field.css({
        				transform: 'rotate(' + value + 'deg)'
        			});
        		}

        	}

			radian += step;
			angle = radian * (180 / Math.PI);
		}.bind(this));
	},


	/**
	 * (setSpeedPosition)
	 */

	setSpeedPosition: function(speed) {

		if(speed < 0) speed = 0;
		if(speed > 240) speed = 240;

		speed = -120 + (speed);

		this.speedoIndicator.css({
			transform: 'rotate(' + speed + 'deg)'
		});
	},


	/**
	 * (setGPSHeading)
	 */

	setGPSHeading: function(heading) {

		// 0 = North, 180 = South

		this.gpsPanel.css({
			transform: 'rotate(' + heading + 'deg)'
		});
	},





})); /** EOF **/
