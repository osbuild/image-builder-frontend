FISTBOOT_SERVICE := $(shell base64 -w0 < aux/custom-first-boot.service)

help:
	@cat Makefile

src/constants.ts: aux/custom-first-boot.service
	sed -i "s/.*FIRST_BOOT_SERVICE_DATA.*/export const FIRST_BOOT_SERVICE_DATA = '$(FISTBOOT_SERVICE)';/" $@

.PHONY: prep
prep: src/constants.ts

.PHONY: install
install:
	npm install

.PHONY: start
start: prep
	npm start

