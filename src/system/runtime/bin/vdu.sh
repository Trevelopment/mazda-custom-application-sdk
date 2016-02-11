#!/bin/sh
#
# Custom Applications SDK for Mazda Connect Infotainment System
# 
# A mini framework that allows to write custom applications for the Mazda Connect Infotainment System
# that includes an easy to use abstraction layer to the JCI system.
#
# Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-applications-sdk)
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
# This will dump all vehicle data, every second 
#

# Initialization
OUTPUT=/tmp/root/casdk


# GPS Position
dbus-send --print-reply --address=unix:path=/tmp/dbus_service_socket --type=method_call --dest=com.jci.lds.data /com/jci/lds/data com.jci.lds.data.GetPosition > ${OUTPUT}-gps

# Vehicle VDM Data
smdb-read -v -n vdm_vdm > ${OUTPUT}-vdm

# Vehicle VDM History Data
smdb-read -v -n vdm_history_data > ${OUTPUT}-vdmhistory

# Vehicle VDM PID Data
smdb-read -v -n vdm_vdt_pid_data > ${OUTPUT}-vdtpid

# Vehicle VDT Current Data
smdb-read -v -n vdm_vdt_current_data > ${OUTPUT}-vdtcurrent

# Vehicle VDT History Data 
smdb-read -v -n vdm_vdt_history_data > ${OUTPUT}-vdthistory

# Vehicle VDT Settings
smdb-read -v -n vdm_vdt_settings_data > ${OUTPUT}-vdtsettings

# Vehicle IDM Data
smdb-read -v -n vdm_idm > ${OUTPUT}-idm

# Vehicle IDM History
smdb-read -v -n vdm_idm_history > ${OUTPUT}-idmhistory

#smdb-read -v -n vdm_vdt_current_data -e VehicleSpeed >> vdm_vdt_current_data-VehicleSpeed.txt
#smdb-read -v -n vdm_vdt_current_data -e EngineSpeed >> vdm_vdt_current_data-EngineSpeed.txt


