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
 * Uploader
 */


drivelist = require('drivelist');

function getRemovalDrives(error, disks) {

    var z = 0;
    var mount_points = new Array();
    var mount_points_sizes = new Array();

    if (error) throw error;
    disks.forEach(function(entry) {
        //convert size to a number
        var size = parseInt(entry.size);
        var is_ATA = entry.description.indexOf("ATA") //ATA is hdd on windows test other systemsS

        if(size<550&&entry.system!=true&&is_ATA==-1) //try and avoid getting the c drive 
        {
            mount_points[z] = entry.mountpoint;
            mount_points_sizes[z] = size;
            z++;
        }
    });
};

