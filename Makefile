FISTBOOT_SERVICE := $(shell base64 -w0 < aux/custom-first-boot.service)
INSTALL_DIR := ~/.local/share/cockpit/image-builder-frontend

help:
	@cat Makefiles

.PHONY: prep
prep: src/constants.ts

.PHONY: install
install:
	npm install

.PHONY: start
start: prep
	npm start

cockpit/all: devel-uninstall devel-install build

devel-install:
	mkdir -p ~/.local/share/cockpit
	ln -s $(shell pwd)/cockpit/public $(INSTALL_DIR)

build:
	npm run build:cockpit

devel-uninstall:
	rm -rf $(INSTALL_DIR)
	rm cockpit/public/*.css
	rm cockpit/public/*.js

.PHONY: cockpit/all devel-install build devel-uninstall

