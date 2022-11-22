#!/bin/bash

IB_DIR=$(pwd)
PROVISIONING_DIR=$IB_DIR/../provisioning-frontend
CLOUD_CONFIG_DIR=$IB_DIR/../cloud-services-config

PROVISIONING_REPO='https://github.com/RHEnVision/provisioning-frontend.git'
CLOUD_CONFIG_REPO='https://github.com/RedHatInsights/cloud-services-config.git'

if [ ! -d $PROVISIONING_DIR ]
then
  cd $IB_DIR/.. && git clone $PROVISIONING_REPO &&
  cd $PROVISIONING_DIR && npm install
fi  
if [ ! -d $CLOUD_CONFIG_DIR ]
then
  cd $IB_DIR/.. && git clone $CLOUD_CONFIG_REPO &&
  cd $CLOUD_CONFIG_DIR && mkdir -p "beta/config" && cp -R chrome "beta/config"
fi  

cd $CLOUD_CONFIG_DIR && npx http-server -p 8889 &
cd $PROVISIONING_DIR && BETA=true npm run start:federated &
cd $IB_DIR && STAGE=true npm run prod-beta
