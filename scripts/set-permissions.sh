USER="root"
GROUP="cpugovernorapplet"


chown $USER:$GROUP -R /sys/devices/system/cpu/
chmod g+w -R /sys/devices/system/cpu/
