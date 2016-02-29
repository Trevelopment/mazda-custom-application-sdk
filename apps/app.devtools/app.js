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
 * Vehicle Data Diagnostic
 *
 * This is a the frameworks internal application to monitor the data values
 *
 */


CustomApplicationsHandler.register("app.devtools", new CustomApplication({

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

        images: {},

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

        title: 'Dev Tools',

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
         * (hasLeftButton) indicates if the UI left button / return button should be shown
         */

        hasLeftButton: false,

        /**
         * (hasMenuCaret) indicates if the menu item should be displayed with an caret
         */

        hasMenuCaret: false,

        /**
         * (hasRightArc) indicates if the standard right car should be displayed
         */

        hasRightArc: false,

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

        var that = this;

        // create log buffer
        this.buffer = [];

        // create global logger
        window.Logger = {

            defaultId: 'Developer Logger',

            error: function(message, id) {
                this.log('ERROR', id ? id : this.defaultId, message);
            },

            info: function(message, id) {
                this.log('INFO', id ? id : this.defaultId, message);
            },

            debug: function(message, id) {
                this.log('DEBUG', id ? id : this.defaultId, message);
            },

            watch: function(message, id) {
                this.log('WATCH', id ? id : this.defaultId, message);
            },

            log: function(level, id, message, color) {

                that.log(level, id, messages, color);
            }
        };

        /**
         * Global Error
         */
        /*onerror = function(message, url, line) {
            Logger.log("ERROR", Logger.defaultId + ":" + url.replace(/^.*[\\\/]/, '') +":" + line, message);
        };*/

        /**
         * EnableLogger
         */

        if(typeof(CustomApplicationLog) != "undefined") {
           // CustomApplicationLog.enableLogger(true);
        }

        // create interface
        this.createInterface();
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


        switch(eventId) {

            /**
             * Scroll Down
             */

            case "cw":

                //this.scrollElement(this.canvas.find(".panel.active"), itemHeight);

                break;

            /**
             * Scroll Up
             */

            case "ccw":

                //this.scrollElement(this.canvas.find(".panel.active"), -1 * itemHeight);

                break;

            /**
             * Middle Press
             */

            case "selectStart":

                this.buffer = [];

                this.update();

                break;

        }

    },

   

    /***
     *** Applicaton specific methods
     ***/

    /**
     * (createInterface)
     *
     * This method creates the interface
     */

    createInterface: function() {
        // create tabbed menu
        this.output = $("<div/>").addClass("output").appendTo(this.canvas);

    },

    /**
     * (log)
     *
     * This method adds items to the panel
     */

    log: function(level, id, message, color) {

        var item = $("<div/>").attr("level", level);

        var d = new Date();

        item.append($("<span/>").append(sprintr("{0}:{1}:{2}", d.getHours(), d.getMinutes(), d.getSeconds())));
        item.append($("<span/>").addClass(level).append(level));
        item.append($("<span/>").append(id));
        item.append($("<span/>").addClass(level).append(message));

        // add to output
        this.buffer.push(item);

        if(this.buffer.length > 50) {
            while(this.buffer.length > 50) this.buffer.shift();
        }

        this.update();

    },

    /**
     * (update)
     *
     * Updates the display
     */

    update: function() {

        this.output.empty().append(this.buffer);

    },

   

}));