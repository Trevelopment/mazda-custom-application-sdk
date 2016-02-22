#!/bin/sh
#
# Custom Applications SDK for Mazda Connect Infotainment System
# 
# A mini framework that allows to write custom applications for the Mazda Connect Infotainment System
# that includes an easy to use abstraction layer to the JCI system.
#
# Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-application-sdk)
# Copyright (c) 2016. All rights reserved.
# 
# WARNING: The installation of this application requires modifications to your Mazda Connect system.
# If you don't feel comfortable performing these changes, please do not attempt to install this. You might
# be ending up with an unusuable system that requires reset by your Dealer. You were warned!
#
# This program is free software: you can redistribute it and/or modify it under the terms of the 
# GNU General Public License as published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
# the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
# License for more details.
# 
# You should have received a copy of the GNU General Public License along with this program. 
# If not, see http://www.gnu.org/licenses/
#

# 
# Runtime Cleanup Script
#

# enable read/write
mount -o rw,remount /

# reset sm.conf
if [ -f /jci/sm/sm.conf.casdk ]; then
	echo "Recovering sm.conf"
	cp -a /jci/sm/sm.conf.casdk /jci/sm/sm.conf
	rm /jci/sm/sm.conf.casdk
fi

# reset opera.ini
if [ -f /jci/opera/opera_home/opera.ini.casdk ]; then
	echo "Recovering opera.ini"
	cp -a /jci/opera/opera_home/opera.ini.casdk /jci/opera/opera_home/opera.ini
	rm /jci/opera/opera_home/opera.ini.casdk
fi

# kill all watch processes
echo "Removing watch processes"
pkill -f watch

# install data reader files
if [ -e /jci/casdk ]; then
 echo "Removing data script folder /jci/casdk"
 rm /jci/casdk/*
 rmdir --ignore-fail-on-non-empty /jci/casdk
fi


# copy initialization file
if [ -f /jci/scripts/stage_wifi.sh.casdk ]; then
	echo "Removing staging script"
	cp -a /jci/scripts/stage_wifi.sh.casdk /jci/scripts/stage_wifi.sh
	rm /jci/scripts/stage_wifi.sh.casdk
fi

# remove sym links
if [ -e /jci/gui/apps/system/applications ]; then
	echo "Removing symlink for applications"
	rm /jci/gui/apps/system/applications
fi

if [ -e /jci/gui/apps/system/data ]; then
	echo "Removing symlink for data"
	rm /jci/gui/apps/system/data
fi

# patch systemApp
if [ -f /jci/gui/apps/system/js/systemApp.js.casdk ]; then
	echo "Recovering systemApp.js"
	cp /jci/gui/apps/system/js/systemApp.js.casdk /jci/gui/apps/system/js/systemApp.js
	rm /jci/gui/apps/system/js/systemApp.js.casdk
fi

echo "Cleanup complete"
# finalize with message
/jci/tools/jci-dialog --title="Custom Application Runtime" --text="The Custom Application Runtime was successfully removed.\n\nPlease reboot system" --ok-label='OK' --no-cancel &
