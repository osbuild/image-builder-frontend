PACKAGE_NAME = cockpit-image-builder
INSTALL_DIR_BASE = /share/cockpit/
INSTALL_DIR = $(INSTALL_DIR_BASE)$(PACKAGE_NAME)
APPSTREAMFILE=org.image-builder.$(PACKAGE_NAME).metainfo.xml

VERSION := $(shell grep "^Version:" cockpit/$(PACKAGE_NAME).spec | sed 's/[^[:digit:]]*\([[:digit:]]\+\).*/\1/')
COMMIT = $(shell git rev-parse HEAD)

# TODO: figure out a strategy for keeping this updated
COCKPIT_REPO_COMMIT = a70142a7a6f9c4e78e71f3c4ec738b6db2fbb04f
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
# Install target for specfile
#

.PHONY: install
install:
	$(MAKE) cockpit/install

#
# Cockpit related targets
#

.PHONY: cockpit/clean
cockpit/clean:
	rm -f cockpit/public/*.css
	rm -f cockpit/public/*.js

.PHONY: cockpit/install
cockpit/install:
	mkdir -p $(DESTDIR)$(PREFIX)$(INSTALL_DIR)
	cp -a cockpit/public/* $(DESTDIR)$(PREFIX)$(INSTALL_DIR)
	mkdir -p $(DESTDIR)$(PREFIX)/share/metainfo
	msgfmt --xml -d po \
		--template cockpit/public/$(APPSTREAMFILE) \
		-o $(DESTDIR)$(PREFIX)/share/metainfo/$(APPSTREAMFILE)

.PHONY: cockpit/devel-uninstall
cockpit/devel-uninstall: PREFIX=~/.local
cockpit/devel-uninstall:
	rm -rf $(PREFIX)$(INSTALL_DIR)

.PHONY: cockpit/devel-install
cockpit/devel-install: PREFIX=~/.local
cockpit/devel-install:
	PREFIX="~/.local"
	mkdir -p $(PREFIX)$(INSTALL_DIR_BASE)
	ln -s $(shell pwd)/cockpit/public $(PREFIX)$(INSTALL_DIR)

.PHONY: cockpit/download
cockpit/download: Makefile
	@git rev-list --quiet --objects $(COCKPIT_REPO_TREE) -- 2>/dev/null || \
	    git fetch --no-tags --no-write-fetch-head --depth=1 $(COCKPIT_REPO_URL) $(COCKPIT_REPO_COMMIT)
	git archive $(COCKPIT_REPO_TREE) -- $(COCKPIT_REPO_FILES) | tar x

.PHONY: cockpit/build
cockpit/build: cockpit/download
	npm run build:cockpit

.PHONY: cockpit/devel
cockpit/devel: cockpit/devel-uninstall cockpit/build cockpit/devel-install

#
# Building packages
#

RPM_SPEC=cockpit/$(PACKAGE_NAME).spec
NODE_MODULES_TEST=package-lock.json
TARFILE=$(PACKAGE_NAME)-$(VERSION).tar.gz

$(RPM_SPEC): $(RPM_SPEC) $(NODE_MODULES_TEST)
	provides=$$(npm ls --omit dev --package-lock-only --depth=Infinity | grep -Eo '[^[:space:]]+@[^[:space:]]+' | sort -u | sed 's/^/Provides: bundled(npm(/; s/\(.*\)@/\1)) = /'); \
	awk -v p="$$provides" '{gsub(/%{VERSION}/, "$(VERSION)"); $(SUB_NODE_ENV) gsub(/%{NPM_PROVIDES}/, p)}1' $< > $@

$(TARFILE): export NODE_ENV ?= production
$(TARFILE): cockpit/build
	touch -r package.json package-lock.json
	touch cockpit/public/*
	tar czf $(TARFILE) --transform 's,^,$(PACKAGE_NAME)/,' \
		--exclude node_modules \
		$$(git ls-files) $(RPM_SPEC) $(NODE_MODULES_TEST) cockpit/public/ cockpit/README.md
	realpath $(TARFILE)

dist: $(TARFILE)
	@ls -1 $(TARFILE)

.PHONY: srpm
srpm: $(TARFILE)
	rpmbuild -bs \
		--define "_sourcedir `pwd`" \
		--define "_topdir $(CURDIR)/rpmbuild" \
		$(RPM_SPEC)

.PHONY: rpm
rpm: $(TARFILE)
	rpmbuild -bb \
		--define "_sourcedir `pwd`" \
		--define "_topdir $(CURDIR)/rpmbuild" \
		$(RPM_SPEC)
