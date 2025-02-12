#!/bin/sh

set -eux

cd "${0%/*}/../../.."

# show some system info
nproc
free -h
echo "osbuild rpms:"
rpm -qa | grep osbuild
echo "cockpit rpms:"
rpm -qa | grep cockpit

npm ci

npm run test:cockpit
