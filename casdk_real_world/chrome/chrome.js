//
// Let system thinking it under opera 12.10
//
window.opera = {
    version: function () {
        return 12.10;
    }
};


// make some config for working
guiConfig.pcLogging = true;             // Send log to console
guiConfig.debugPanelEnabled = true;     // Show virtual console

// Log all (debug included)
for(var propertyName in log._logLevels) {
    log._logLevels[propertyName] = 1;
}

//var _getStartupSettingsFast 

GuiFramework.prototype._getStartupSettings = function()
{
    log.info("* * * * * GUI is ready.  Sending Global.GetStartupSettings event to MMUI. * * * * *");

    // Global.GetStartupSettings is newly added to get region and units settings from MMUI
    this.sendEventToMmui("common", "Global.GetStartupSettings");
    this.initGuiCalled = false;
    var self = this;
    setTimeout( function()
    {
        if (!self.initGuiCalled)
        {
            log.error("SYS_SETTINGS app didn\'t set all required values before timeout. CPP_GUIFWK is issuing initGui with necessary default values.");
            self.initGuiCalled = true;

            // We do not use strict equality here in case one of these checks return undefined, it will still set the default value
            if (framework.localize.getRegion() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set region, using Region_NorthAmerica");
                framework.localize.setRegion(framework.localize.REGIONS.NorthAmerica);
            }
            if (framework.localize.getCurrentLanguage() == null)    //Localization currently initializes this to en_US
            {
               log.warn("SYS_SETTINGS app didn\'t set language, using en_US");
               framework.localize.setLanguage("en_US", true);
              // framework.localize.setLanguage("fr_CN", true);
               
            }
            if (framework.localize.getKeyboardLanguage() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set keybaord language, using en_US");
                framework.localize.setKeyboardLanguage("en_US");
            }
            if (framework.localize.getTimeFormat() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set time format, using 12hrs");
                framework.localize.setTimeFormat(framework.localize.TIME_FORMATS.T12hrs);
            }
            if (framework.localize.getTemperatureUnit() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set temperature unit, using Fahrenheit");
                framework.localize.setTemperatureUnit(framework.localize.TMPRTURE_UNITS.Fahrenheit);
            }
            if (framework.localize.getDistanceUnit() == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set ditance unit, using Miles");
                framework.localize.setDistanceUnit(framework.localize.DISTANCE_UNITS.Miles);
            }
            if (framework.getSharedData('syssettings', 'VehicleType') == null)
            {
                log.warn("SYS_SETTINGS app didn\'t set VehicleType, using J36");
                framework.localize.setVehicleType("J36");
            }
            self.initGui();
        }
    }, 200);
}

