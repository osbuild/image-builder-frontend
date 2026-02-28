#!/bin/bash
set -e

if [ ! -f /app/package.json ]; then
    exec /usr/sbin/init "$@"
fi

mkdir -p /root/.local/share/cockpit
rm -rf /root/.local/share/cockpit/cockpit-image-builder
ln -sfn /app/cockpit/public /root/.local/share/cockpit/cockpit-image-builder

cd /app
export FORCE_COLOR=1
npm ci
make cockpit/download
npm run build:cockpit
echo ''
echo '=========================================='
echo '  Build complete. Cockpit is starting.'
echo '  Open http://localhost:9091 when ready'
echo '  (Cockpit may take 30-60 seconds to start)'
echo '=========================================='
echo ''

npm run build:cockpit:watch &
exec /usr/sbin/init "$@"
