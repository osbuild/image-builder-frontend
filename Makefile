
.PHONY: help
help:
	@echo "make [TARGETS...]"
	@echo
	@echo "This is the maintenance makefile of osbuild-composer. The following"
	@echo "targets are available:"
	@echo
	@echo "    help:               Print this usage information."
	@echo "    container:          Build a container to run the frontend."
	@echo "                        Implicitly used by https://github.com/osbuild/osbuild-getting-started/"

# either "docker" or "sudo podman"
# podman needs to build as root as it also needs to run as root afterwards
CONTAINER_EXECUTABLE ?= sudo podman

DOCKER_IMAGE := image-builder-frontend_devel
DOCKERFILE := distribution/Dockerfile

# All files to check for rebuild!
SRC_DEPS := $(shell find . -not -path './node_modules/*' -not -path './dist/*' -name "*.ts" -or -name "*.tsx" -or -name "*.yml" -or -name "*.yaml" -or -name "*.json" -or -name "*.js")

clean:
	rm -f container_built.info

container_built.info: $(DOCKERFILE) $(SRC_DEPS)
	$(CONTAINER_EXECUTABLE) build -t $(DOCKER_IMAGE) -f $(DOCKERFILE) .
	echo "Container last built on" > $@
	date >> $@

.PHONY: container
container: container_built.info
