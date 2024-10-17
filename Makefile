FISTBOOT_SERVICE := $(shell base64 -w0 < aux/custom-first-boot.service)
INSTALL_DIR := ~/.local/share/cockpit/image-builder-frontend
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



all: devel-install build devel-uninstall

# this requires a built source tree and avoids having to install anything system-wide
devel-install:
	mkdir -p ~/.local/share/cockpit
	ln  -sfn $(shell pwd)/cockpit/public $(INSTALL_DIR)
	mkdir -p pkg/lib
	git clone --depth 1 --branch main https://github.com/cockpit-project/cockpit.git temp_cockpit_repo
	cp -r temp_cockpit_repo/pkg/lib/* pkg/lib/
	rm -rf temp_cockpit_repo

build:
	@echo "Building Cockpit using Webpack."
	./node_modules/webpack/bin/webpack.js --config cockpit/webpack.config.ts

devel-uninstall:
	rm -f $(INSTALL_DIR)
	rm -rf pkg/lib/
	rm -rf pkg/
	rm -rf dist/

.PHONY: all devel-install build devel-uninstall

