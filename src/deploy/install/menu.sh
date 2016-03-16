#!/bin/sh

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
		./install.sh 2>&1

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
		./cleanup.sh 2>&1
		
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





