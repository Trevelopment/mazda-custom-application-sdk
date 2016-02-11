smdb-read -v -n vdm_vdt_pid_data > vdm_vdt_pid_data.txt
smdb-read -v -n traffic_stm > traffic_stm.txt
smdb-read -v -n vdm > vdm.txt
smdb-read -v -n vdm_history_data > vdm_history_data.txt
smdb-read -v -n vdm_idm > vdm_idm.txt
smdb-read -v -n vdm_idm_history > vdm_idm_history.txt
smdb-read -v -n vdm_vdt_5000DrvLog_data > vdm_vdt_5000DrvLog_data.txt
smdb-read -v -n vdm_vdt_current_data > vdm_vdt_current_data.txt
smdb-read -v -n vdm_vdt_history_data > vdm_vdt_history_data.txt
smdb-read -v -n vdm_vdt_onehrlog_data > vdm_vdt_onehrlog_data.txt
smdb-read -v -n vdm_vdt_settings_data > vdm_vdt_settings_data.txt
smdb-read -v -n vdm_vdt_current_data -e VehicleSpeed >> vdm_vdt_current_data-VehicleSpeed.txt
smdb-read -v -n vdm_vdt_current_data -e EngineSpeed >> vdm_vdt_current_data-EngineSpeed.txt