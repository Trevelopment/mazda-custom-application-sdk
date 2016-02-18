#!/bin/sh
# Update to Waisky2’s addon-all-fixed-auto-install-v2
# V3.0 - Initial
# V3.2 - Removed temperatures that did not work right,
#        added trip fuel economy which is based on cmu trip which does not correspond to speedometer trip <yet>,
#        changed so all data is rounded which fixed smdb-read speed mismatch to cruse control
#        enlarged direction text,
#        cleaned up code
# V3.21 - Changed metric display to L per 100km
# V3.3 - Changes done by diginix:
#        added unit under speedometer for mph or km/h
#        replace dot with comma for L per 100km
#        optimized speed indicator angles in css
#        new graphics for rings, needle pointer, dial image with different layout for steps 5,10,20
#        html and css cleanup
#        some more layout tuning (e.g. text shadow)
# V3.4   rotating compass added
# V3.5   Heading deleted, Latitude & Longitude added


mount -o rw,remount /

# -- Disable watchdogs in /jci/sm/sm.conf to avoid boot loops if smthing goes wrong --

# backup first
cp -a /jci/sm/sm.conf /jci/sm/sm.conf.bak3

# edit now
sed -i 's/watchdog_enable="true"/watchdog_enable="false"/g' /jci/sm/sm.conf
sed -i 's|args="-u /jci/gui/index.html"|args="-u /jci/gui/index.html --noWatchdogs"|g' /jci/sm/sm.conf


# -- Enable userjs and allow file XMLHttpRequest in /jci/opera/opera_home/opera.ini --

# backup first
cp -a /jci/opera/opera_home/opera.ini /jci/opera/opera_home/opera.ini.bak3

# edit now
sed -i 's/User JavaScript=0/User JavaScript=1/g' /jci/opera/opera_home/opera.ini
count=$(grep -c "Allow File XMLHttpRequest=" /jci/opera/opera_home/opera.ini)
if [ "$count" = "0" ]; then
    sed -i '/User JavaScript=.*/a Allow File XMLHttpRequest=1' /jci/opera/opera_home/opera.ini
else
    sed -i 's/Allow File XMLHttpRequest=.*/Allow File XMLHttpRequest=1/g' /jci/opera/opera_home/opera.ini
fi


# if user has already used the earlier versions
# backup and "disable" it
mv /jci/opera/opera_dir/userjs/speedometer.js /jci/opera/opera_dir/userjs/speedometer.js.bak3
mv /jci/opera/opera_dir/userjs/addon-startup.js /jci/opera/opera_dir/userjs/addon-startup.js.bak3
mv /jci/opera/opera_dir/userjs/mySpeedometer.js /jci/opera/opera_dir/userjs/mySpeedometer.js.bak3
mv /jci/opera/opera_dir/userjs/fps.js /jci/opera/opera_dir/userjs/fps.js.bak3
mv /jci/scripts/stage_wifi.sh /jci/scripts/stage_wifi.sh.bak3
mv /jci/scripts/get-vehicle-speed.sh /jci/scripts/get-vehicle-speed.sh.bak3
mv /jci/scripts/get-vehicle-gear.sh /jci/scripts/get-vehicle-gear.sh.bak3
mv /jci/scripts/get-vehicle-data-other.sh /jci/scripts/get-vehicle-data-other.sh.bak3
mv /jci/scripts/get-gps-data.sh /jci/scripts/get-gps-data.sh.bak3

for USB in a b c d e
do
	INSTALLSH=/tmp/mnt/sd${USB}1
	if [ -e "${INSTALLSH}/install.sh" ]
	then
		cd ${INSTALLSH}
		break
	fi
done

#
cp -a jci/opera/opera_dir/userjs/addon-startup.js /jci/opera/opera_dir/userjs/
cp -a jci/scripts/* /jci/scripts/
cp -a jci/gui/addon-* /jci/gui/
cp -a bin/busybox-armv7l /bin/

#
chmod 755 /jci/gui/addon-common/*.js

chmod 755 /jci/gui/addon-speedometer/*.js

chmod 755 /jci/gui/addon-player/*.js
# Default versions of these to start up with. They get copied to rw location of /tmp/root on initialization
chmod 666 /jci/gui/addon-player/myVideoList
chmod 666 /jci/gui/addon-player/playback*
chmod 755 /jci/gui/addon-player/playback-action.sh

chmod 755 /jci/scripts/stage_wifi.sh
chmod 755 /jci/scripts/get-vehicle-speed.sh
chmod 755 /jci/scripts/get-vehicle-data-other.sh
chmod 755 /jci/scripts/get-gps-data.sh

#
chmod 755 /bin/busybox-armv7l
rm -f /usr/bin/nc
ln -s /bin/busybox-armv7l /usr/bin/nc

/jci/tools/jci-dialog --title="Tweaks v3.5 Install Complete" --text="Speedometer by Trookam (Redesign by diginix)\nRotating Compass by diginix\n\nPlease reboot system" --ok-label='OK' --no-cancel &