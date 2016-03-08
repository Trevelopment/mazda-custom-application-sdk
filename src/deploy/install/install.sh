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
# Modified to include install/desinstall on same stick + log + more user message
#
#
# Runtime Installation Script
#


#
# INSTALLSH is the folder of this script
# 
INSTALLSH=$(dirname $(readlink -f $0))
cd ${INSTALLSH}


echo -------------------------------------
echo -------------------------------------
echo -------------------------------------
echo Start Log 							  
echo -------------------------------------
echo -------------------------------------
echo -------------------------------------



while true
do

	echo -------------------------------------
	echo Main menu 							  
	echo -------------------------------------

	/jci/tools/jci-dialog --3-button-dialog --title="Custom Application Runtime" --text="Main menu" --ok-label="Install" --cancel-label="Remove" --button3-label="SSH/Exit"
	choice=$?

	if [ $choice = 0 ]; then

		/jci/tools/jci-dialog --title="Custom Application Runtime" --text="Installation ... please wait" --ok-label='OK' &

	echo -------------------------------------
		echo Install 							  
		echo -------------------------------------
		# enable read/write

		echo mount -o rw,remount
		mount -o rw,remount /

		# disable watchdog
		if [ ! -f /jci/sm/sm.conf.casdk ]; then
			echo "Disable watchdog"
			cp -a /jci/sm/sm.conf /jci/sm/sm.conf.casdk 2>&1
			sed -i 's/watchdog_enable="true"/watchdog_enable="false"/g' /jci/sm/sm.conf 2>&1
			sed -i 's|args="-u /jci/gui/index.html"|args="-u /jci/gui/index.html --noWatchdogs"|g' /jci/sm/sm.conf 2>&1
		else 
			echo "skip Disable watchdog"
		fi



		# modify opera.ini
		if [ ! -f /jci/opera/opera_home/opera.ini.casdk ]; then

			echo opera.ini modification

			# make a copy
			cp -a /jci/opera/opera_home/opera.ini /jci/opera/opera_home/opera.ini.casdk 2>&1

			# enable user javascript
			sed -i 's/User JavaScript=0/User JavaScript=1/g' /jci/opera/opera_home/opera.ini 2>&1

			# enable file ajax
			count=$(grep -c "Allow File XMLHttpRequest=" /jci/opera/opera_home/opera.ini)
			if [ "$count" = "0" ]; then
			    sed -i '/User JavaScript=.*/a Allow File XMLHttpRequest=1' /jci/opera/opera_home/opera.ini 2>&1
			else
			    sed -i 's/Allow File XMLHttpRequest=.#/Allow File XMLHttpRequest=1/g' /jci/opera/opera_home/opera.ini 2>&1
			fi

			# enable javascript logging
			sed -i 's/Console Error Log Enabled=0/Console Error Log Enabled=1/g' /jci/opera/opera_home/opera.ini
			sed -i 's/Console Error Log=$OPERA_HOME\/error.log/Console Error Log=\/tmp\/root\/casdk-error.log/g' /jci/opera/opera_home/opera.ini

			echo -------------------------------------
			echo opera.ini 							  
			echo -------------------------------------
			cat /jci/opera/opera_home/opera.ini 	   2>&1
			echo -------------------------------------

		else 

			echo -------------------------------------
			echo opera.ini skipped 					  
			echo -------------------------------------
			cat /jci/opera/opera_home/opera.ini 	   2>&1
			echo -------------------------------------

		fi


		# modify opera storage and move to persistant data
		if [ ! -e /tmp/mnt/data_persist/storage ]; then
			echo "modify opera storage and move to persistant data"
			mkdir -p /tmp/mnt/data_persist/storage 2>&1
		else 
			echo "skip modify opera storage and move to persistant data"
		fi

		if [ ! -f /jci/opera/opera_home/pstorage/psindex.dat.casdk ]; then

			echo psindex.dat modification

			if [ -f /jci/opera/opera_home/pstorage/psindex.dat ]; then
				# make a copy
				cp -a /jci/opera/opera_home/pstorage/psindex.dat /jci/opera/opera_home/pstorage/psindex.dat.casdk 2>&1
			else 
				mkdir -p /jci/opera/opera_home/pstorage/
			fi
			cp -a storage/psindex.dat /jci/opera/opera_home/pstorage/ 2>&1


			echo -------------------------------------
			echo psindex.dat 						  
			echo -------------------------------------
			cat /jci/opera/opera_home/pstorage/psindex.dat 2>&1
			echo -------------------------------------
		else 
			echo -------------------------------------
			echo psindex.dat skipped 				  
			echo -------------------------------------
			cat /jci/opera/opera_home/pstorage/psindex.dat 2>&1
			echo -------------------------------------

		fi


		# disable fps counter - it's really annoying! So I am doing you a favor here.
		if [ -f /jci/opera/opera_dir/userjs/fps.js ]; then
			echo "rename /jci/opera/opera_dir/userjs/fps.js"
			mv /jci/opera/opera_dir/userjs/fps.js /jci/opera/opera_dir/userjs/fps.js.casdk 2>&1
		else 
			echo "skip  rename /jci/opera/opera_dir/userjs/fps.js"
		fi

		# install data reader files
		echo "copy script and binary"
		mkdir -p /jci/casdk 2>&1
		cp -a casdk/scripts/* /jci/casdk 2>&1
		find /jci/casdk/ -name "vdt*.sh" -exec chmod 755 {} \; 
		cp -a casdk/bin/* /jci/casdk 2>&1
		chmod 755 /jci/casdk/websocketd 2>&1
		chmod 755 /jci/casdk/adb 2>&1
		chmod 755 /jci/casdk/adbmonitor 2>&1

		echo -------------------------------------
		echo /jci/casdk
		echo -------------------------------------
		ls -al /jci/casdk/ 2>&1
		echo -------------------------------------

		# copy proxy
		if [ ! -f /jci/opera/opera_dir/userjs/CustomApplicationsProxy.js ]; then
			echo "copy proxy"
			cp -a casdk/proxy/CustomApplicationsProxy.js /jci/opera/opera_dir/userjs/ 2>&1
		else 
			echo "skip copy proxy"
		fi

		# create custom folder
		if [ ! -e /jci/gui/apps/custom ]; then
			echo "create custom folder"
			mkdir -p /jci/gui/apps/custom 2>&1
		else 
			echo "skip create custom folder"
		fi

		# copy initialization file
		if [ ! -f /jci/scripts/stage_wifi.sh.casdk ]; then
			cp -a /jci/scripts/stage_wifi.sh /jci/scripts/stage_wifi.sh.casdk
			cp -a casdk/jci/stage_wifi.sh /jci/scripts/
			chmod 755 /jci/scripts/stage_wifi.sh

			echo -------------------------------------
			echo stage_wifi.sh
			echo -------------------------------------
			cat /jci/scripts/stage_wifi.sh 2>&1
			echo -------------------------------------
		else 
			echo -------------------------------------
			echo stage_wifi.sh skipped
			echo -------------------------------------
			cat /jci/scripts/stage_wifi.sh 2>&1
			echo -------------------------------------

		fi


		# create symlinks to various destinations
		echo make link
		ln -sf /tmp/mnt/sd_nav/system/js /jci/gui/apps/custom/js 2>&1
		ln -sf /tmp/mnt/sd_nav/system/css /jci/gui/apps/custom/css 2>&1
		ln -sf /tmp/mnt/sd_nav/system/templates /jci/gui/apps/custom/templates 2>&1
		ln -sf /tmp/mnt/sd_nav/system/runtime /jci/gui/apps/custom/runtime 2>&1
		ln -sf /tmp/mnt/sd_nav/apps /jci/gui/apps/custom/apps 2>&1
		ln -sf /tmp/root /jci/gui/apps/custom/data 2>&1


		# complete installation
		echo "Installation complete"

		# finalize with message
		killall jci-dialog
		/jci/tools/jci-dialog --title="Custom Application Runtime" --text="The Custom Application Runtime was successfully installed.\n\nPlease reboot system" --ok-label='Main Menu' --cancel-label="Exit"
		if [ $? = 1 ]; then
			break;
		fi

	elif [ $choice = 1 ]; then

		/jci/tools/jci-dialog --title="Custom Application Runtime" --text="Removing ... please wait" --ok-label='OK' --no-cancel &

	echo -------------------------------------
		echo Remove
		echo -------------------------------------

		# enable read/write
		mount -o rw,remount /

		# reset sm.conf
		if [ -f /jci/sm/sm.conf.casdk ]; then
			echo "Recovering sm.conf"
			cp -a /jci/sm/sm.conf.casdk /jci/sm/sm.conf 2>&1
			rm /jci/sm/sm.conf.casdk 2>&1
		fi

		# reset opera.ini
		if [ -f /jci/opera/opera_home/opera.ini.casdk ]; then
			echo "Recovering opera.ini"
			cp -a /jci/opera/opera_home/opera.ini.casdk /jci/opera/opera_home/opera.ini 2>&1
			rm /jci/opera/opera_home/opera.ini.casdk 2>&1
		fi

		# reset storage
		if [ -e /tmp/mnt/data_persist/storage ]; then
			echo "Removing storage folder"
			rm -rf /tmp/mnt/data_persist/storage 2>&1
		fi

		if [ -f /jci/opera/opera_home/pstorage/psindex.dat.casdk ]; then
			echo "Removing local storage settings"
			cp -a /jci/opera/opera_home/pstorage/psindex.dat.casdk /jci/opera/opera_home/pstorage/psindex.dat 2>&1
			rm /jci/opera/opera_home/pstorage/psindex.dat.casdk 2>&1
		fi

		# kill all watch processes
		echo "Removing watch processes"
		pkill -f watch 2>&1

		# remove data reader files
		if [ -e /jci/casdk ]; then
		 echo "Removing data script folder /jci/casdk"
		 rm /jci/casdk/* 2>&1
		 rmdir --ignore-fail-on-non-empty /jci/casdk 2>&1
		fi


		# remove initialization file
		if [ -f /jci/scripts/stage_wifi.sh.casdk ]; then
			echo "Removing staging script"
			cp -a /jci/scripts/stage_wifi.sh.casdk /jci/scripts/stage_wifi.sh 2>&1
			rm /jci/scripts/stage_wifi.sh.casdk 2>&1
		fi

		# remove proxy
		if [ -f /jci/opera/opera_dir/userjs/CustomApplicationsProxy.js ]; then
			echo "Removing proxy"
			rm /jci/opera/opera_dir/userjs/CustomApplicationsProxy.js 2>&1
		fi

		# delete custom
		if [ -e /jci/gui/apps/custom ]; then
			echo "Removing custom application"
			rm -rf /jci/gui/apps/custom 2>&1
		fi
		echo "Cleanup complete"
		# finalize with message
		killall jci-dialog
		/jci/tools/jci-dialog --title="Custom Application Runtime" --text="The Custom Application Runtime was successfully removed.\n\nPlease reboot system" --ok-label='Main Menu' --cancel-label="Exit"
		if [ $? = 1 ]; then
			break;
		fi

	elif [ $choice = 2 ]; then

		echo -------------------------------------
		echo SSH
		echo -------------------------------------
		/jci/tools/jci-dialog --title="SSH Connection" --text="Make a Android SSH Connection from usb port or Exit script." --ok-label='SSH' --cancel-label="Exit" 
		if [ $? = 1 ]; then
			break;
		fi

		/jci/tools/jci-dialog --title="SSH Connection" --text="Connect your Android to a Mazda USB port." --ok-label='OK' --no-cancel &
		echo "exec ${INSTALLSH}/adb wait-for-device "
		${INSTALLSH}/adb wait-for-device 2>&1
		killall jci-dialog
		echo "exec ${INSTALLSH}/adb reverse tcp:2222 tcp:22"
		${INSTALLSH}/adb reverse tcp:2222 tcp:22  2>&1

		/jci/tools/jci-dialog --title="SSH Connection" --text="on Android do ssh root@localhost -p 2222 \n\npassword is jci"  --ok-label='Main menu' --cancel-label="Exit"
		if [ $? = 1 ]; then
			break;
		fi
	fi
done

/jci/tools/jci-dialog --title="Custom Application Runtime" --text="dump in progress ... please wait" --ok-label='OK' --no-cancel &

#
# Some system info
# 
echo ------------ 
echo system  	  
echo ------------ 
uname -a  	      

echo ------------
echo cpuinfo     
echo ------------
cat /proc/cpuinfo 2>&1

#
# List of mounted drive
#
echo ------------
echo mnt         
echo ------------
ls -l /mnt        2>&1

echo ------------ 
echo home  		  
echo ------------ 
echo ~  		  

echo ------------
echo process 	 
echo ------------
ps -T             2>&1

echo ------------
echo netstat 	 
echo ------------
netstat -a        2>&1

echo ------------
echo set         
echo ------------
set               2>&1

echo ------------
echo disk        
echo ------------
df -h             2>&1


echo END OF SCRIPT 2>&1

killall jci-dialog
/jci/tools/jci-dialog --title="Custom Application Runtime" --text="You can remove your usbstick" --ok-label='OK' --no-cancel





