PACKAGE_NAME = image-builder-frontend
INSTALL_DIR = /share/cockpit/$(PACKAGE_NAME)

# TODO: figure out a strategy for keeping this updated
COCKPIT_REPO_COMMIT = b0e82161b4afcb9f0a6fddd8ff94380e983b2238
COCKPIT_REPO_URL = https://github.com/cockpit-project/cockpit.git
COCKPIT_REPO_TREE = '$(strip $(COCKPIT_REPO_COMMIT))^{tree}'

# checkout common files from Cockpit repository required to build this project;
# this has no API stability guarantee, so check out a stable tag when you start
# a new project, use the latest release, and update it from time to time
COCKPIT_REPO_FILES = \
	pkg/lib \
	$(NULL)

help:
	@cat Makefile

#
# Cockpit related targets
#

.PHONY: cockpit/clean
cockpit/clean:
	rm -f cockpit/public/*.css
	rm -f cockpit/public/*.js

.PHONY: cockpit/devel-uninstall
cockpit/devel-uninstall: PREFIX=~/.local
cockpit/devel-uninstall:
	rm -rf $(PREFIX)$(INSTALL_DIR)

.PHONY: cockpit/devel-install
cockpit/devel-install: PREFIX=~/.local
cockpit/devel-install:
	PREFIX="~/.local"
	mkdir -p $(PREFIX)$(INSTALL_DIR)
	ln -s $(shell pwd)/cockpit/public $(PREFIX)$(INSTALL_DIR)

.PHONY: cockpit/download
cockpit/download: Makefile
	@git rev-list --quiet --objects $(COCKPIT_REPO_TREE) -- 2>/dev/null || \
	    git fetch --no-tags --no-write-fetch-head --depth=1 $(COCKPIT_REPO_URL) $(COCKPIT_REPO_COMMIT)
	git archive $(COCKPIT_REPO_TREE) -- $(COCKPIT_REPO_FILES) | tar x

.PHONY: cockpit/build
cockpit/build: cockpit/download
	npm ci
	npm run build:cockpit

.PHONY: cockpit/devel
cockpit/devel: cockpit/devel-uninstall cockpit/build cockpit/devel-install
