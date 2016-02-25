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
				if(this.systemApp.isCustomApplicationBootstrapped) {

					// overwrite list2 handler
					this.systemApp._contextTable[this.systemAppCategory].controlProperties.List2Ctrl.selectCallback = this.menuItemSelectCallback;

					// overwrite framework MMUI handlers
					this.__routeMmmuiMsg = framework.routeMmuiMsg;
					framework.routeMmuiMsg = this.routeMmuiMsg;
					framework.sendEventToMmui = this.sendEventToMmui;

					// intercept MMUI messages in the framework
					//framework.origRouteMmuiMsg = framework.routeMmuiMsg;
					//framework.routeMmuiMsg = additionalAppRouteMmuiMsg.bind(framework);
					//framework.sendEventToMmui = additionalAppSendEventToMmui.bind(framework);

					// finalize
					this.systemApp.isCustomApplicationBootstrapped = true;
				}
			},
		},

		/**
		 * (addMenuItem)
		 */

		addMenuItem: function() {

			/*
					// add additional apps to 'Applications' list
			for (var i = 0; i < additionalApps.length; ++i) {
				var additionalApp = additionalApps[i];
				systemApp._masterApplicationDataList.items.push({ appData : { appName : additionalApp.name, isVisible : true,  mmuiEvent : 'Select'+additionalApp.name }, text1Id : additionalApp.name, disabled : false, itemStyle : 'style01', hasCaret : false });
				//framework.localize._appDicts[systemAppId][additionalApp.name] = additionalApp.label;
				framework.common._contextCategory._contextCategoryTable[additionalApp.name+'.*'] = category;
			}
			*/
		},


		/**
		 * (Overwrite) menuItemSelectCallback
		 */

		 menuItemSelectCallback: function(listCtrlObj, appData, params) {

		 	if(appData.mmuiEvent == "ExecuteCustomApplication") {

		        return this._runCustomApplication(appData);

		    }

			for (var i = 0; i < additionalApps.length; ++i) {
				var additionalApp = additionalApps[i];
				if(additionalApp.name === appData.appName) {
					framework.additionalAppName = appData.appName;
					framework.additionalAppContext = 'Start';
					appData = JSON.parse(JSON.stringify(appData));
					appData.appName = additionalAppReplacedAppName;
					appData.mmuiEvent = additionalAppReplacedMmuiEvent;
					break;
				}
			}

			// pass to original handler
			this.systemApp._menuItemSelectCallback(listCtrlObj, appData, params);
		},


		/**
		 * (Overwrite) routeMmuiMsg
		 */

		routeMmuiMsg: function(jsObject) {

			// switch my msgtype
			switch(jsObject.msgType) {
				case 'ctxtChg':
					if(this.additionalAppName && jsObject.uiaId == additionalAppReplacedAppName) {
						jsObject.uiaId = this.additionalAppName;
						jsObject.ctxtId = this.additionalAppContext;
					}
					break;
				case 'focusStack':
					var additionalAppInFocusStack = false;
					if(this.additionalAppName) {
						for(var i = 0; i < jsObject.appIdList.length; i++) {
							var appId = jsObject.appIdList[i];
							if(appId.id == additionalAppReplacedAppName) {
								appId.id = this.additionalAppName;
							}
							if(appId.id == this.additionalAppName) {
								additionalAppInFocusStack = true;
							}
						}
					}
					if(!additionalAppInFocusStack) {
						this.additionalAppName = null;
						this.additionalAppContext = null;
					}
				case 'msg': // fall-through to alert
				case 'alert':
					if(this.additionalAppName && jsObject.uiaId == additionalAppReplacedAppName) {
						jsObject.uiaId = this.additionalAppName;
					}
					break;
				default:
					// do nothing
					break;
			}

			this.__routeMmmuiMsg(jsObject);
		},


		/**
		 * (Overwrite) sendEventToMmui
		 */

		sendEventToMmui: function(uiaId, eventId, params, fromVui) {

			if(uiaId == this.additionalAppName) {
				uiaId = additionalAppReplacedAppName;
			}

		    var currentUiaId = this.getCurrentApp();
		    var currentContextId = this.getCurrCtxtId();

		    if(currentUiaId == this.additionalAppName) {
		    	currentUiaId = additionalAppReplacedAppName;
		    	currentContextId = additionalAppReplacedAppContext;
		    }

		    this.websockets.sendEventMsg(uiaId, eventId, params, fromVui, currentUiaId, currentContextId);

		     // Let debug know about the message
		    this.debug.triggerEvtToMmuiCallbacks(uiaId, eventId, params);
		},


		/**
		 * (loadCustomApplications)
		 */

		 loadCustomApplications: function() {

		    try {

		        if(typeof(CustomApplicationsHandler) == "undefined") {

		            // try to load the script
		            utility.loadScript("apps/system/applications/runtime/runtime.js", false, function() {

		                this._initCustomApplicationsDataList();
		            }.bind(this));

		            setTimeout(function() {

		                if(typeof(CustomApplicationsHandler) == "undefined") {

		                    this.CustomApplicationLoadCount = this.CustomApplicationLoadCount + 1;

		                    // 20 attempts or we forget it - that's almost 3min
		                    if(this.CustomApplicationLoadCount < 20) {
		                        
		                        this._loadCustomApplications();
		                    }
		                }

		            }.bind(this), 10000);

		        }

		    } catch(e) {
		        // if this fails, we won't attempt again because there could be issues with the actual handler
		        setTimeout(function() {
		            this._loadCustomApplications();
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

		                    this._masterApplicationDataList.items.push(item);

		                }.bind(this));

		                this._readyApplications();

		            }.bind(this));
		        }
		    } catch(e) {

		    }
		},

		/**
		 * (runCustomApplication)
		 */

		runCustomApplication: function(appData) {

		    if(typeof(CustomApplicationsHandler) != "undefined") {
		        CustomApplicationsHandler.run(appData);
		    }
		},

	}

}.call(this));

/**
 * Runtime Caller
 */

(function () {
	window.opera.addEventListener('AfterEvent.load', function (e) {
		CustomApplicationsProxy.bootstrap();
	});
})();