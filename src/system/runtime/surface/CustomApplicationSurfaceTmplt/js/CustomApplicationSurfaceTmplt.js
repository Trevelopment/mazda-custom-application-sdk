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
 * (CustomApplication) Template Handler for JCI
 *
 * This will create the main surface for a custom application and keeps in line with the
 * focus stack of the JCI system
 */


log.addSrcFile("CustomApplicationSurfaceTmplt.js", "customapplicationsurface");

/*
 * =========================
 * Constructor
 * =========================
 */
function CustomApplicationSurfaceTmplt(uiaId, parentDiv, templateID, controlProperties)
{
    this.divElt = null;
    this.templateName = "CustomApplicationSurfaceTmplt";
    this.onScreenClass = "CustomApplicationSurfaceTmplt";

    log.debug("templateID in CustomApplicationSurfaceTmplt constructor: " + templateID);

    //@formatter:off
    //set the template properties
    this.properties = {
        "statusBarVisible" : true,
        "leftButtonVisible" : true,
        "hasActivePanel" : false,
        "isDialog" : false,
    }
    //@formatter:on

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;
    this.divElt.className = "TemplateWithStatusLeft CustomApplicationSurfaceTmplt";

    parentDiv.appendChild(this.divElt);

    // initiate main application
}

/*
 * =========================
 * Standard Template API functions
 * =========================
 */

/* (internal - called by the framework)
 * Handles multicontroller events.
 * @param   eventID (string) any of the “Internal event name” values in IHU_GUI_MulticontrollerSimulation.docx (e.g. 'cw',
 * 'ccw', 'select')
 */

CustomApplicationSurfaceTmplt.prototype.handleControllerEvent = function(eventID)
{
    log.debug("handleController() called, eventID: " + eventID);
}


/*
 * Called by the app during templateNoLongerDisplayed. Used to perform garbage collection procedures on the template and
 * its controls.
 */
CustomApplicationSurfaceTmplt.prototype.cleanUp = function()
{

}

framework.registerTmpltLoaded("CustomApplicationSurfaceTmplt");
