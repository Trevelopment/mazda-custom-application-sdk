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
 * Mazda Infotainment Simulator
 */

/**
 * Startup
 */

var fs = require('fs'),
    app = require('app'),
    BrowserWindow = require('browser-window'),
    Menu = require('menu'),
    Dialog = require('dialog'),
    mainWindow = null;

// Start crash reporter
require('crash-reporter').start();

/**
 * (Storage)
 */

/**
 * (app)
 */

// Quit when all windows are closed.
app.on('window-all-closed', function() {

  app.quit(); // close the app if all windows are closed

});


// Get ready for action
app.on('ready', function() {


  // Create the main window
  mainWindow = new BrowserWindow({
    width: 1280,
    height:755,
    title: app.getName(),
    resizable: false,
    center: true,
    webPreferences: {
      webSecurity: false
    },
    shown: false,
  });

  // and load the interface
  mainWindow.loadURL('file://' + __dirname + '/interface/interface.html');

  // build menu
  BuildAppMenu();

  // clear the window when it's closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

});

/**
 * Menu
 */

var BuildAppMenu = function() {

  var appName = app.getName();

  var ApplicationMenu = [
    {
      label: 'Simulator',
      submenu: [
        {
          label: 'About ' + appName,
          role: 'about',
          click: function() {
            Dialog.showMessageBox({
              type: 'info',
              title: 'About',
              message: 'Simulator for Custom Application SDK\n\nThis is an alpha release.\n\n(c) 2016 flyandi'
            })
          }
        },
        /*{
          label: 'Check for Updates',
        },*/
        {
          type: 'separator'
        },
        {
          label: 'Choose Runtime Location',
          accelerator: 'CmdOrCtrl+L',
          click: function() {

            var result = Dialog.showOpenDialog({
              title: 'Choose Runtime Location',
              properties: ['openDirectory']
            });

            if(result && result[0]) {
              mainWindow.webContents.send('runtimeLocation', result[0]);
            }
          }
        },
        {
          label: 'Choose Applications Location',
          accelerator: 'CmdOrCtrl+O',
          click: function() {

            var result = Dialog.showOpenDialog({
                title: 'Choose Applications Location',
                properties: ['openDirectory']
              });

            if(result && result[0]) {
              mainWindow.webContents.send('appsLocation', result[0]);
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Reload Runtime'
        },
        {
          label: 'Reload Applications',
          accelerator: 'CmdOrCtrl+R'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { 
            app.quit(); 
          }
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Simulator',
          type: 'checkbox', 
          checked: true,
          disabled: true,
        },
        {
          label: 'Showcase',
          type: 'checkbox', 
          disabled: true,
        },
        {
          type: 'separator'
        },
        {
          label: 'Application Screenshot',
          accelerator: 'Command+P',
          click: function() {
            mainWindow.capturePage({x: 0, y: 0, width: 800, height: 480}, function(image) {

              // get fn
              fn = "casdk-simulator-" + Math.floor(Date.now() / 1000 | 0) + ".png";

              // save image to desktop
              fs.writeFile(app.getPath("desktop") + "/" + fn, image.toPng(), function (err) {});
            });
          }
        },
      ],
    },
    {
      label: 'Debug',
      submenu: [
        {
            label: 'Show Development Tools',
            accelerator: 'CmdOrCtrl+A',
            click: function() {
              mainWindow.openDevTools();
            }
        }
      ],
    }
  ];

  // build menu

  menu = Menu.buildFromTemplate(ApplicationMenu);
  Menu.setApplicationMenu(menu);

}

/** EOF **/