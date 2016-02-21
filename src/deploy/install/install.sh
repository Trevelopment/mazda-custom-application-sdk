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
# Runtime Installation Script
#

# enable read/write
mount -o rw,remount /

# disable watchdog
cp -a /jci/sm/sm.conf /jci/sm/sm.conf.casdk
sed -i 's/watchdog_enable="true"/watchdog_enable="false"/g' /jci/sm/sm.conf
sed -i 's|args="-u /jci/gui/index.html"|args="-u /jci/gui/index.html --noWatchdogs"|g' /jci/sm/sm.conf

# enable XMLHttpRequest
cp -a /jci/opera/opera_home/opera.ini /jci/opera/opera_home/opera.ini.casdk

count=$(grep -c "Allow File XMLHttpRequest=" /jci/opera/opera_home/opera.ini)
if [ "$count" = "0" ]; then
    sed -i '/User JavaScript=.#/a Allow File XMLHttpRequest=1' /jci/opera/opera_home/opera.ini
else
    sed -i 's/Allow File XMLHttpRequest=.#/Allow File XMLHttpRequest=1/g' /jci/opera/opera_home/opera.ini
fi

# find installation folder
for USB in a b c d e
do
	INSTALLSH=/tmp/mnt/sd${USB}1
	if [ -e "${INSTALLSH}/install.sh" ]
	then
		cd ${INSTALLSH}
		break
	fi
done

# install data reader files
mkdir -p /jci/casdk
cp -a casdk/scripts/* /jci/casdk
find /jci/scripts/ -name "vdt*.sh" -exec chmod 755 {} \;

# copy initialization file
cp -a /jci/scripts/stage_wifi.sh /jci/scripts/stage_wifi.sh.casdk
cp -a casdk/jci/stage_wifi.sh /jci/scripts/
chmod 755 /jci/scripts/stage_wifi.sh

# prepare runtime symlinks - currently only sd card is supported
ln -s /tmp/mnt/sd_nav/applications /jci/gui/apps/system/applications
ln -s /tmp/root /jci/gui/apps/system/data

# patch systemApp
cp -a /jci/gui/apps/system/js/systemApp.js /jci/gui/apps/system/js/systemApp.js.casdk


# finalize with message
/jci/tools/jci-dialog --title="Custom Application Runtime" --text="The Custom Application Runtime was successfully installed.\n\nPlease reboot system" --ok-label='OK' --no-cancel &
