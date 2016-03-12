/**
 * Custom Applications SDK for Mazda Connect Infotainment System
 *
 * A mini framework that allows to write custom applications for the Mazda Connect Infotainment System
 * that includes an easy to use abstraction layer to the JCI system.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-application-sdk)
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
 * Layout
 */


var Layout = {

    /**
     * @method
     */
    fillAttributes: function(instance, data) {

        $.each(data, function(key, value) {

            instance.find("[field=" + key + "]").empty().append(value);

        });

    },

    /**
     * @method
     */
    item: function(id, data) {

        var instance = $("<fragment/>").append($("template[id=" + id + "]").html());

        if(instance) {

            this.fillAttributes(instance, data);

            return instance.data("data", data);
        }

        return false;
    },

    /**
     * @method
     */
    items: function(name, data) {

       return data.map(function(item) {

            return this.item(name, item);

        }.bind(this));
    },

    /**
     * @method
     */

    progress: function(element) {

        var result = {

            setPosition: function(position, total) {

                var total = total || this.__total,
                    width = element.find("div").width(),
                    left = Math.floor((position * width) / total);

                this.__total = total;

                element.find("span").width(left);
            },

            setFull: function() {
                this.setPosition(1, 1);
            },

            setTotal: function(total) {
                this.__total = total;
            },

            setLabel: function(label) {

                element.find("label").html(label);
            },

            reset: function(label) {

                this.setPosition(0, 100);

                this.setLabel(label ? label : 'Preparing');
            },

        };

        result.reset();

        return result;

    },

};