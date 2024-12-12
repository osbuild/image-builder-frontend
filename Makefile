INSTALL_DIR := ~/.local/share/cockpit/image-builder-frontend

COCKPIT_REPO_URL = https://github.com/cockpit-project/cockpit.git
COCKPIT_REPO_COMMIT = b0e82161b4afcb9f0a6fddd8ff94380e983b2238

# checkout common files from Cockpit repository required to build this project;
# this has no API stability guarantee, so check out a stable tag when you start
# a new project, use the latest release, and update it from time to time
COCKPIT_REPO_FILES = \
	pkg/lib \
	$(NULL)

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

cockpit/clean:
	rm -rf $(INSTALL_DIR)
	rm -rf pkg/lib
	rm -f cockpit/public/*.css
	rm -f cockpit/public/*.js

cockpit/install:
	mkdir -p ~/.local/share/cockpit
	ln -s $(shell pwd)/cockpit/public $(INSTALL_DIR)

COCKPIT_REPO_TREE = '$(strip $(COCKPIT_REPO_COMMIT))^{tree}'
cockpit/download: Makefile
	@git rev-list --quiet --objects $(COCKPIT_REPO_TREE) -- 2>/dev/null || \
	    git fetch --no-tags --no-write-fetch-head --depth=1 $(COCKPIT_REPO_URL) $(COCKPIT_REPO_COMMIT)
	git archive $(COCKPIT_REPO_TREE) -- $(COCKPIT_REPO_FILES) | tar x

cockpit/build:
	npm run build:cockpit

cockpit/devel: cockpit/clean cockpit/download cockpit/install cockpit/build

.PHONY: cockpit/devel cockpit/install cockpit/build cockpit/clean

