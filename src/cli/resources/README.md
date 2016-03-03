# Custom Applications SDK Command Line Utility

A mini CLI tool that allows you to create instantly custom applications for the Mazda Infotainment System.

This is part of the Custom Application SDK for the Mazda Infotainment System which can be found at http://flyandi.github.io/mazda-custom-application-sdk

## Installation

This tool requires to have ```node``` and ```npm``` installed on your computer.

To install this tool, just type:

```
	npm install casdk
```

## Usage

Currently the CLI includes the following commands:

### ```create <name>```

Creates a bare bone application that includes the basics. This is the best way to get started if you are new to building applications or even a seasoned engineer.

**Hint:** You should run this tool in the directory where you store your applications and have your Simulator watching it.

Example:

```
	casdk create myapp
```

This will create a new app in the directory ```app.myapp``` containing the three primary files ```app.js```, ```app.css``` and ```app.png```.


## Future

This tool will be extended with more functionality, especially with commands line ```publish``` and ```transfer```.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
License for more details.