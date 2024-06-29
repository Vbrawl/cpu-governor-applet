# CPU Governor
This applet allows a Cinnamon Desktop Environment user to easily control their CPU Governor from the GUI.
The applet doesn't require elevated privileges except for a single startup script that prepares the system (basically chowns the /sys/devices/system/cpu/ folder to root:cpugovernorapplet).

Anyone in the cpugovernorapplet group is able to modify the CPU Governor, you may want to edit the install scripts if you are an advanced user.

## Note for advanced users
The applet itself simply writes to the /sys/devices/system/cpu/cpufreq/policyX/scaling_governor to change the CPU Governor, it doesn't require the custom group that's added by the install script in any way. Actually the only thing it requires is the "add-applet-to-menu.sh" script, the other's can be skipped if you have your own way to set the user's privileges to allow them to edit the scaling_governor files.

# Installation
```bash
sudo sh install.sh
```

Then in the Cinnamon's panel click right-click->Applets and add the `CPU Governor` to the panel.

# Uninstallation
```bash
sudo sh uninstall.sh
```