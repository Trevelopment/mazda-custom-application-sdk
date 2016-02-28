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
 * (CustomApplicationsProxy)
 *
 * Registers itself between the JCI system and CustomApplication runtime.
 */


(function() {

	CustomApplicationsProxy = {

		/**
		 * (locals)
		 */

		systemAppId: 'system',
		systemAppCategory: 'Applications',

		proxyAppName: 'vdt',
		proxyAppContext: 'DriveChartDetails',
		proxyMmuiEvent: 'SelectDriveRecord',

		targetAppName: 'custom',
		targetAppContext: 'Surface',


		/**
		 * (bootstrap)
		 *
		 * Bootstraps the JCI system
		 */

		 bootstrap: function() {


			// verify that core objects are available
			if(typeof framework === 'object' && framework._currentAppUiaId === this.systemAppId) {

				// retrieve system app
				this.systemApp = framework.getAppInstance(this.systemAppId);

				// verify bootstrapping - yeah long name
				if(!this.systemApp.isCustomApplicationBootstrapped) {

					// overwrite list2 handler
					this.systemApp._contextTable[this.systemAppCategory].controlProperties.List2Ctrl.selectCallback = this.menuItemSelectCallback.bind(this.systemApp);

					// detect usb changes
					this.systemApp.overwriteStatusMenuUSBAudioMsgHandler = this.systemApp._StatusMenuUSBAudioMsgHandler;
					this.systemApp._StatusMenuUSBAudioMsgHandler = this.StatusMenuUSBAudioMsgHandler.bind(this.systemApp);

					// overwrite framework MMUI handlers
					framework.overwriteRouteMmmuiMsg = framework.routeMmuiMsg;
					framework.routeMmuiMsg = this.routeMmuiMsg.bind(framework);
					framework.sendEventToMmui = this.sendEventToMmui.bind(framework);

					// assign template transition
					framework.transitionsObj._genObj._TEMPLATE_CATEGORIES_TABLE.SurfaceTmplt = 'Detail with UMP';

					// finalize
					this.systemApp.isCustomApplicationBootstrapped = true;

					// kick off loader - implemention only for sdcard right now
					this.prepareCustomApplications();
				}
			}
		},


		/**
		 * (Overwrite) menuItemSelectCallback
		 */

		menuItemSelectCallback: function(listCtrlObj, appData, params) {

			try {

		       	var proxy = CustomApplicationsProxy;

			 	if(appData.mmuiEvent == "SelectCustomApplication") {

			 		// exit if handler is not available
			        if(typeof(CustomApplicationsHandler) == "undefined") return false;

			        // exit if application is not registered
			        if(!CustomApplicationsHandler.launch(appData)) return false;

			        // clone app data
			        appData = JSON.parse(JSON.stringify(appData));

			        // set app data
			        appData.appName = proxy.proxyAppName;
			        appData.mmuiEvent = proxy.proxyMmuiEvent;
			    }

			} catch(e) {
				// do nothing
			}

			// pass to original handler
			this._menuItemSelectCallback(listCtrlObj, appData, params);
		},


		/**
		 * (Overwrite) sendEventToMmui
		 */

		sendEventToMmui: function(uiaId, eventId, params, fromVui) {

    		var proxy = CustomApplicationsProxy,
    			currentUiaId = this.getCurrentApp(),
    			currentContextId = this.getCurrCtxtId();

    		// proxy overwrites
		    if(currentUiaId == proxy.targetAppName) {
		    	currentUiaId = this.proxyAppName;
		    	currentContextId = this.proxyAppContext;
		    }

		    // pass to web sockets
   			this.websockets.sendEventMsg(uiaId, eventId, params, fromVui, currentUiaId, currentContextId);

     		// Let debug know about the message
    		this.debug.triggerEvtToMmuiCallbacks(uiaId, eventId, params);
		},


		/**
		 * (Overwrite) routeMmuiMsg
		 */

		routeMmuiMsg: function(jsObject) {

			try {

				var proxy = CustomApplicationsProxy;

				// validate routing message
				switch(jsObject.msgType) {

					// magic switch
					case 'ctxtChg':
						if(jsObject.uiaId == proxy.proxyAppName) {
							jsObject.uiaId = proxy.targetAppName;
							jsObject.ctxtId = proxy.targetAppContext;
						}
						break;

					// check if our proxy app is in the focus stack
					case 'focusStack':

						if(jsObject.appIdList && jsObject.appIdList.length) { 
							for(var i = 0; i < jsObject.appIdList.length; i++) {
								var appId = jsObject.appIdList[i];
								if(appId.id == proxy.proxyAppName) {
									appId.id = proxy.targetAppName;
								}
							};
						}

					case 'msg':
					case 'alert':

						if(jsObject.uiaId == proxy.proxyAppName) {
							jsObject.uiaId = proxy.targetAppName;
						}

						break;
					default:
						// do nothing
						break;
				}

			} catch(e) {

				// do nothing
			}

			// pass to original
			this.overwriteRouteMmmuiMsg(jsObject);
		},


		/**
		 * (Overwrite) StatusMenuUSBAudioMsgHandler
		 */

		StatusMenuUSBAudioMsgHandler: function(msg) {

			// pass to original handler
			this.overwriteStatusMenuUSBAudioMsgHandler(msg);
		},


		/**
		 * (prepareCustomApplications)
		 */

		prepareCustomApplications: function() {

		    this.loadCount = 0;
		    setTimeout(function() {
		        this.loadCustomApplications();
		    }.bind(this), this.debug ? 500 : 15000); // first attempt wait 15s - the system might be booting still anyway

		},


		/**
		 * (loadCustomApplications)
		 */

		 loadCustomApplications: function() {

		    try {

		        if(typeof(CustomApplicationsHandler) == "undefined") {

		            // try to load the script
		            utility.loadScript("apps/custom/runtime/runtime.js", false, function() {

		                this.initCustomApplicationsDataList();

		            }.bind(this));

		            setTimeout(function() {

		                if(typeof(CustomApplicationsHandler) == "undefined") {

		                    this.loadCount = this.loadCount + 1;

		                    // 20 attempts or we forget it - that's almost 3min
		                    if(this.loadCount < 20) {

		                        this.loadCustomApplications();
		                    }
		                }

		            }.bind(this), 10000);

		        }

		    } catch(e) {
		        // if this fails, we won't attempt again because there could be issues with the actual handler
		        setTimeout(function() {

		            this.loadCustomApplications();

		        }.bind(this), 10000);
		    }
		},

		/**
		 * (initCustomApplicationsDataList)
		 */

		initCustomApplicationsDataList: function() {
		    // extend with custom applications
		    try {
		        if(typeof(CustomApplicationsHandler) != "undefined") {

		            CustomApplicationsHandler.retrieve(function(items) {

		                items.forEach(function(item) {

		                    this.systemApp._masterApplicationDataList.items.push(item);

		                    framework.localize._appDicts[this.systemAppId][item.appData.appName.replace(".", "_")] = item.title;

		                    framework.common._contextCategory._contextCategoryTable[item.appData.appName + '.*'] = 'Applications';

		                }.bind(this));

		                this.systemApp._readyApplications();

		            }.bind(this));
		        }
		    } catch(e) {
		    	// failed to register applications
		    }
		},

	}

}.call(this));

/**
 * Runtime Caller
 */

(function () {
	if(window.opera) {
		window.opera.addEventListener('AfterEvent.load', function (e) {
			CustomApplicationsProxy.bootstrap();
		});
	}
})();

/** EOF **/