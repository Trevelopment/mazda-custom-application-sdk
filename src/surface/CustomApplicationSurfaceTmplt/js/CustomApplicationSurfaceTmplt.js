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
    // create context
    this.divElt = null;
    this.templateName = "CustomApplicationSurfaceTmplt";
    //this.onScreenClass = "CustomApplicationSurfaceTmplt";

    this.onScreenClass = "TestTemplateWithStatusLeft";
    this.offScreenLeftClass = "TestTemplateWithStatusLeft-OffscreenLeft";
    this.offScreenRightClass = "TestTemplateWithStatusLeft-OffscreenRight";

    log.debug("templateID in CustomApplicationSurfaceTmplt constructor: " + templateID);

    // get active application
    this.application = CustomApplicationsHandler.getCurrentApplication();

    //set the template properties
    this.properties = {
        "statusBarVisible" : this.application.getStatusbar(),
        "leftButtonVisible" : this.application.getLeftButton(), 
        "hasActivePanel" : false,
        "isDialog" : false
    }

    // create the div for template
    this.divElt = document.createElement('div');
    this.divElt.id = templateID;

    // set the correct template class
    switch(true) {

        case this.properties.leftButtonVisible:
            this.divElt.className = "TemplateWithStatusLeft";
            break;

        case this.properties.statusBarVisible:
            this.divElt.className = "TemplateWithStatus";
            break;

        default:
            this.divElt.className = "TemplateFull";
            break;
    }

    // assign to parent
    parentDiv.appendChild(this.divElt);

    // wakeup
    this.application.__wakeup(this.divElt);

    // finish application creation
    setTimeout(function() {    

        // there is no really work around for this. The templates context is never changed and
        // so none of the standard template callbacks are called. Anything else would require
        // to change the GUIFramework which would be awful :-)

        // set framework specifics
        if(this.properties.statusBarVisible) {

            // execute statusbar handler
            framework.common.statusBar.setAppName(this.application.getStatusbarTitle());

            // execute custom icon
            var icon = this.application.getStatusbarIcon();

            if(icon) framework.common.statusBar.setDomainIcon(icon);

            // adjust home button
            framework.common.statusBar.showHomeBtn(this.application.getStatusbarHomeButton());

        }

    }.bind(this), 50);
}



/**
 * CleanUp
 */

CustomApplicationSurfaceTmplt.prototype.cleanUp = function()
{
    CustomApplicationsHandler.sleep(this.application);
}

/**
 * MultiController
 */

CustomApplicationSurfaceTmplt.prototype.handleControllerEvent = function(eventID)
{
    this.application.__handleControllerEvent(eventID);
}


// Finalize
framework.registerTmpltLoaded("CustomApplicationSurfaceTmplt");
