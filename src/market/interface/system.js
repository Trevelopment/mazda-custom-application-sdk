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
 * @includes
 */
var fs = require("fs"),
    drivelist = require('nodejs-disks'),
    request = require("request"),
    http = require("http");


/**
 * System
 * @namespace
 */

var System = {

    /**
     * @paths
     */

    __appsManifest: 'apps.json',

    __appsRuntimeInformation: 'http://code/sandbox/mazda-custom-application-sdk/src/debug/market/runtime.json',

    /**
     * The location
     * @var string
     */
    __location: false,

    /**
     * Returns the current location
     * @param callback
     */
    hasLocation: function(callback) {

        // check if file exists
        var error = !this.__location,
            path = false;

        if(!error) {

            var _path = this.__location + this.__appsManifest;

            if(fs.lstatSync(_path).isFile()) {
                path = _path;
                error = false;
            }
        }

        return callback(error, path);
    },


    /**
     * Returns the current drives mounted to the host system
     * @param callback
     */

    getDrives: function(callback) {

        drivelist.drives(function(error, drives) {

            // get details
            drivelist.drivesDetail(drives, function(error, details) {

                var result = [];

                details.forEach(function(item) {

                    try {
                        if(fs.lstatSync(item.mountpoint).isDirectory()) {
                            result.push(item);
                        }
                    } catch(e) {}
                });

                callback(error, result);
            });

        });
    },

    /**
     * @load
     */

    load: function(url, options, callback, progress) {

        var downloaded = 0;

        // get request
        var req = request($.extend({}, {
            url: url,
        }, options ? options : {}), function(response) {

            var loaded = 0, body = "";

            console.log(response);

            if(progress && response.headers['content-length']) {   
                progress.setTotal(parseInt(response.headers['content-length'], 10));
            }

            req.on('error', function(error) {
                if(callback) {
                    callback(error, false);
                }
            });

            req.on('data', function(chunk) {

                loaded += chunk.length;
                body += chunk;

                if(progress) {
                    progress.setTotal(parseInt(loaded, 10));
                }
            });

            req.on('end', function() {

                if(callback) {
                    callback(false, body);
                }
            });

        });

    },

    /**
     * @getRuntimeInformation
     */

    getRuntimeInformation: function(callback, progress) {

        if(progress) progress.reset("Loading Manifest");

        this.load(this.__appsRuntimeInformation, {
            json: true
        }, function(error, result) {


        }, progress);
    },


    /**
     * @installLatestRuntime
     */

    installLatestRuntime: function(location, callback, progress) {

        // gather latest runtime information

        this.getRuntimeInformation(function(error, runtime) {

            if(progress) progress.reset("Loading Runtime");

        }, progress);

    }


}