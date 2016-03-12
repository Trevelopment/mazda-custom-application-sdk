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
var fs = require("fs-extra"),
    drivelist = require('nodejs-disks'),
    request = require("request"),
    http = require("http"),
    tar = require("tar-fs");


/**
 * System
 * @namespace
 */

var System = {

    /**
     * @paths
     */

    __appsManifest: 'apps.json',

    __appsReleaseInformation: 'https://github.com/flyandi/mazda-custom-application-sdk/release.json',

    __downloadLocation : __dirname + '/../tmp/',

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

                result = [{volumename:'Test', available: '1 TB', mountpoint: '/tmp/bla'}];

                callback(error, result);
            });

        });
    },

    /**
     * @load
     */

    load: function(url, options, callback, progress) {


        var loaded = 0;

        // clear files
        if(options.output) {
            fs.emptyDirSync(options.output);
        }

        // get request
        var req = request({
            url: url,
            json: options.json,
        }, function(error, response, body) {

            if(progress) {
                progress.setFull();
            }

            if(!options.output) {
                callback(error, body, options);
            }

        }).on('response', function(data) {

            if(data.headers['content-length'] && progress) {
                progress.setTotal(data.headers['content-length']);
            }

        }).on('data', function(chunk) {

            loaded += chunk.length;

            if(progress) {
                progress.setPosition(parseInt(loaded, 10));
            }
        });

        // option
        if(options.output) {

            // pipe
            if(options.untar) {
                req.pipe(tar.extract(options.output).on("finish", function() {

                    callback(false, true);

                }));
            }
        }

    },

    /**
     * @getReleaseInformation
     */

    getReleaseInformation: function(callback, progress) {

        if(progress) progress.reset("Loading release information");

        this.load(this.__appsReleaseInformation, {
            json: true
        }, callback, progress);
    },

    /**
     * @getTarArchive
     */

    getTarArchive: function(url, output, callback, progress, message) {

        if(progress) progress.reset(message);

        // load archive
        this.load(url, {
            output: output,
            untar: true,
        }, function(error, result) {

            if(callback) {
                callback(error, result);
            }

        }.bind(this), progress);
    },

    /**
     * @processDiskOperation
     */

    processDiskOperation: function(location, operations) {

        // file copy checks
        if(location.substr(-1) != "/") location = location + "/";

        // continue operation
        operations.forEach(function(operation) {

            switch(operation.name) {

                /** @prepare */
                case "prepare":

                    operation.values.forEach(function(path) {

                        path = location + path + '/';

                        // ensure the directory is here
                        try {
                            fs.emptyDirSync(path);
                        } catch(e) {

                        }

    

                    });
                    break;


                /** @copy */
                case "copy": 

                    operation.values.forEach(function(copy) {

                        path = location + copy.destination + '/';

                        try {
                            fs.copySync(copy.source, path);
                        } catch(e) {

                        }


                    });

            }

        }.bind(this));


    },


    /**
     * @installLatestRuntime
     */

    installLatestRuntime: function(location, callback, progress) {

        // gather latest runtime information

        this.getReleaseInformation(function(error, release) {

            if(!error && release.packages) {

                var runtimeLocation = release.packages.runtime;

                if(runtimeLocation) {

                    var runtimeDestination = this.__downloadLocation + 'runtime';

                    this.getTarArchive(runtimeLocation, runtimeDestination, function(error, result) {

                        if(progress) progress.reset("Generating AppDrive")

                        // removal operations
                        this.processDiskOperation(location, [
                            {name: 'prepare', values: ['apps/', 'system/']},
                            {name: 'copy', values: [
                                {source: runtimeDestination, destination: 'system'},
                            ]}
                        ]);

                        if(progress) progress.setPosition(1, 2);

                        // done
                        if(callback) {
                            callback(false, true);
                        }

                    }.bind(this), progress, "Loading Runtime")
                }
            } else {
                callback(error, error);
            }

        }.bind(this), progress);

    }


}