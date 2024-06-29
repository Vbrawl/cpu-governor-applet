#!/bin/sh

cp ../scripts/set-permissions.sh /usr/sbin/cpugovernorapplet_set-permissions.sh
cp ../init-scripts/cpugovernorapplet-prepare.service /etc/systemd/system/cpugovernorapplet-prepare.service
systemctl daemon-reload
systemctl enable --now cpugovernorapplet-prepare.service