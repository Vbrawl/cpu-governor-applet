USER=$(who am i | cut -f1 -d' ')
GROUP="cpugovernorapplet"

addgroup --system $GROUP
adduser $USER $GROUP
