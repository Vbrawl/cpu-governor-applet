#!/bin/sh

systemctl disable --now cpugovernorapplet-prepare.service
rm /usr/sbin/cpugovernorapplet_set-permissions.sh
rm /etc/systemd/system/cpugovernorapplet-prepare.service
systemctl daemon-reload