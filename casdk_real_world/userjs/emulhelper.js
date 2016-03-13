var _getStartupSettingsFast = function()
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
};

var backc = 1;

if(window.opera) {
    window.opera.addEventListener('AfterEvent.load', function (e) {
        GuiFramework.prototype._getStartupSettings = _getStartupSettingsFast;

     /*   setInterval( function(){
            document.getElementById('CommonBgImg1').style.background = "url('file://localhost/Users/alex/Sandbox/mazda/casdk_real_world/background/grandiotk/b" + backc + ".png')";
            backc ++;
            if (backc == 15) backc = 1;
        }, 10000);
*/

      ///  document.getElementById('CommonBgImg1').style.background = "url('file://localhost/Users/alex/Sandbox/mazda/casdk_real_world/background/one-piece.jpg')";


    });
}

