#!/bin/bash
set -euo pipefail

source /etc/os-release

sudo dnf install -y \
     libappstream-glib

# RHEL9 has nodejs and npm separately
if [[ "$ID" == rhel && ${VERSION_ID%.*} == 10 ]]; then
    sudo dnf install -y nodejs-npm \
         sqlite # node fails to pull this in
else
    sudo dnf install -y npm
fi

npm ci

make rpm

sudo dnf install -y rpmbuild/RPMS/noarch/*rpm
