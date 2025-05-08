#!/bin/bash
set -euo pipefail

source /etc/os-release

sudo dnf install -y \
     libappstream-glib

if [[ "$ID" == rhel && ${VERSION_ID%.*} == 10 ]]; then
    sudo dnf install -y nodejs-npm \
         sqlite # node fails to pull this in
elif [[ "$ID" == rhel ]]; then
    sudo dnf install -y npm
elif [[ "$ID" == fedora ]]; then
    sudo dnf install -y \
         nodejs-npm \
         sqlite \
         gettext
fi

npm ci

make rpm

sudo dnf install -y rpmbuild/RPMS/noarch/*rpm
