#!/bin/bash

./gen-certs.sh \
	config/x509/openssl.cnf \
	state/x509 \
	state/x509/ca
