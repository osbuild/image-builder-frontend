#!/bin/bash
set -e

if [ ! -f /app/package.json ]; then
    exec /usr/sbin/init "$@"
fi

rm -rf /usr/share/cockpit/cockpit-image-builder
ln -sfn /app/cockpit/public /usr/share/cockpit/cockpit-image-builder

cd /app
npm ci
make cockpit/download
npm run build:cockpit

npm run build:cockpit:watch &
exec /usr/sbin/init "$@"
