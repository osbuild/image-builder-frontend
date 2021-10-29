#!/bin/bash

./gen-certs.sh \
	config/x509/openssl.cnf \
	state/x509 \
	state/x509/ca

# image-builder dashboard
./gen-dashboards \
  --input ../../image-builder/templates/dashboards/grafana-dashboard-insights-image-builder-general.configmap.yml \
  --output ./config/grafana/dashboards/insights-dashboard.json

# composer dashboard
./gen-dashboards \
  --input ../../osbuild-composer/templates/dashboards/grafana-dashboard-image-builder-composer-general.configmap.yml \
  --output ./config/grafana/dashboards/composer-dashboard.json
