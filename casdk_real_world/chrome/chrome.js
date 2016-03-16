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

GuiFramework.prototype._getStartupSettings = function()
{
    log.info("* * * * * GUI is ready.  Sending Global.GetStartupSettings event to MMUI. * * * * *");

    // Global.GetStartupSettings is newly added to get region and units settings from MMUI
    this.sendEventToMmui("common", "Global.GetStartupSettings");
    this.initGuiCalled = false;
    var self = this;
    if (!self.initGuiCalled)
    {
        self.initGuiCalled = true;

        framework.localize.setRegion(framework.localize.REGIONS.Japan);

        //framework.localize.setLanguage("en_US", true);
        //framework.localize.setLanguage("fr_CN", true);
        //framework.localize.setLanguage("ja_JP", true);
        framework.localize.setLanguage("zh_TW", true);


        framework.localize.setKeyboardLanguage("en_US");
        framework.localize.setTimeFormat(framework.localize.TIME_FORMATS.T12hrs);
        framework.localize.setTemperatureUnit(framework.localize.TMPRTURE_UNITS.Celsius);
        framework.localize.setDistanceUnit(framework.localize.DISTANCE_UNITS.Kilometers);
        framework.localize.setVehicleType("J36");

        framework.localize.setDisplayTheme(framework.localize.DISPLAY_THEMES.DisplayTheme_02);


        framework.localize._ChangeLanguageCtxtDataList = {
            itemCountKnown : true,
            itemCount : 0,
            items: [
                "LANGS_US_ENGLISH",
                "LANGS_CN_FRENCH"
             ]
        };

        self.initGui();
    }
}


