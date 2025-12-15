export const exportedDiskBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[[customizations.disk.partitions]]
minsize = "1 GiB"
fs_type = "xfs"
mountpoint = "/"
type = "plain"

[[customizations.disk.partitions]]
minsize = "5 MiB"
fs_type = "ext4"
mountpoint = "/srv/data"
type = "plain"

[[customizations.disk.partitions]]
minsize = "1 KiB"
name = "vg-edited-name"
type = "lvm"

[[customizations.disk.partitions.logical_volumes]]
minsize = "1 GiB"
name = "lv1"
fs_type = "xfs"
mountpoint = "/home"

[[customizations.disk.partitions.logical_volumes]]
minsize = "10 KiB"
name = "lv2-edited"
fs_type = "xfs"
mountpoint = "/tmp/usb"

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};

export const exportedFilesystemBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations]
partitioning_mode = "auto-lvm"

[[customizations.filesystem]]
mountpoint = "/"
minsize = 10737418240

[[customizations.filesystem]]
mountpoint = "/srv/data"
minsize = 1073741824

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};

export const exportedFirewallBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]

[customizations.firewall]
ports = [ "90:tcp" ]

[customizations.firewall.services]
enabled = [ "x" ]
disabled = [ "y" ]`;
};

export const exportedHostnameBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations]
hostname = "testsystemedited"

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};

export const exportedKernelBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations.kernel]
name = "kernel"
append = "rootwait console=tty0 console=ttyS0,115200n8 new=argument"

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};

export const exportedLocaleBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8", "fy_DE.UTF-8", "aa_DJ.UTF-8", "aa_ER.UTF-8" ]
keyboard = "ANSI-dvorak"`;
};

export const exportedSystemdBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations.services]
enabled = [ "enabled-service" ]
masked = [ "masked-service" ]
disabled = [ "disabled-service" ]

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};

export const exportedTimezoneBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[customizations.timezone]
timezone = "Europe/Oslo"
ntpservers = [ "0.nl.pool.ntp.org", "0.de.pool.ntp.org" ]

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};

export const exportedUsersBP = (blueprintName: string): string => {
  return `name = "${blueprintName}"

[[customizations.user]]
name = "admin1"
key = ""
groups = [ "wheel" ]
password = ""

[[customizations.user]]
name = "sshuser"
key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCduw9WD1Tw1pat5x+FzMoZGd3QYDcxAPEvgy5shnSzCYsUsO/OTnG2OrN5UXlQ/6fM1Ass5b54ttbsjORxz90ckaKf7W1qufyiuRbDreEYRVabzFDZKeAI5C0pMPya7Fui4vlChsXAH3XuuiJqwtXFjVQbkyI/F9jkVEJZfqo9AAFWF8L33xLXEq/7WfgB9n8NBEL8QX7R8m/ATpKWyOXkWM/welXgGSeRN+dMllwHcX1VnRim0MMXo9JIp39Nl/x9+2fYO8agYyE73zoJj2oueEhBpO9Vam1EziNuEKseIbVzz0VrfZyMeSN5o1+LWYPbCVETE3jUAbioUDxA/faB test@example.com"
groups = [ "developers" ]
password = ""

[[customizations.user]]
name = "admin2"
key = ""
groups = [ "wheel" ]
password = ""

[[customizations.user]]
name = "newuser"
key = ""
groups = []
password = ""

[customizations.timezone]
timezone = "Etc/UTC"

[customizations.locale]
languages = [ "C.UTF-8" ]`;
};
