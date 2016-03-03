#!/usr/bin/env node
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
 * (casdk) Command line tool helper
 */

var fs = require("fs"),
	colors = require('colors');


/***
 * (createCustomApplication)
 */

var createCustomApplication = function(name, options) {

	var outputDir = (options.ouput || __dirname).replace(/\/$/, ''),
		outputName = 'app.' + name.replace(/\s|-/g, '_'),
		outputLocation = outputDir + '/' + outputName;

	try {
		if(fs.statSync(outputLocation).isDirectory()) {
			console.log(('The application ' + outputName + ' already exists').red);
			console.log(outputLocation.gray);
			return false;
		}
	} catch(e) {
		// continue
	}

	console.log(('Creating application ' + outputName).green);
	console.log(outputLocation.gray);

	// create output directory
	fs.mkdirSync(outputLocation);

	// create app.css
	

};




/**
 * (command processor)
 */

var program = require('commander');

program
  .version('0.0.1')
  .description('A command line tool for building custom applications for the Mazda Infotainment System')

program
  .command('create <name>')
  .description('Creates a new application')
  .option("-o, --output [output]", "The directory where to write the application. Default is the current working directory")
  .action(function(name, options){
  	createCustomApplication(name, options);
  });


program.parse(process.argv);

if (!program.args.length) program.help();















