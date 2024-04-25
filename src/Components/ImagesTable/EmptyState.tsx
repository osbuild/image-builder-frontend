import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Text,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter,
  Bullseye,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  PlusCircleIcon,
  PlusIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { resolveRelPath } from '../../Utilities/path';
import { useExperimentalFlag } from '../../Utilities/useExperimentalFlag';
import { BuildImagesButton } from '../Blueprints/BuildImagesButton';

type ImagesEmptyStateProps = {
  selectedBlueprint?: string;
};

const EmptyBlueprintsImagesTable = () => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        icon={<EmptyStateIcon icon={PlusIcon} />}
        titleText="No images"
        data-testid="empty-state-header"
      />
      <EmptyStateBody>
        <Text>
          The selected blueprint does not contain any images, build images from
          this version or adjust the filters.
        </Text>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <BuildImagesButton variant="link">
            Build images for this version
          </BuildImagesButton>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </Bullseye>
);

const EmptyImagesTable = () => {
  const experimentalFlag = useExperimentalFlag();
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
        {experimentalFlag ? (
          <>
            <EmptyStateHeader
              titleText="No images"
              icon={<EmptyStateIcon icon={SearchIcon} />}
              headingLevel="h4"
            />
            <EmptyStateBody>
              <Text>Images are BLANK. Create blueprints to create images.</Text>
            </EmptyStateBody>
          </>
        ) : (
          <>
            <EmptyStateHeader
              titleText="Create an RPM-DNF image"
              icon={<EmptyStateIcon icon={PlusCircleIcon} />}
              headingLevel="h4"
            />
            <EmptyStateBody>
              <Text>
                Image builder is a tool for creating deployment-ready customized
                system images: installation disks, virtual machines, cloud
                vendor-specific images, and others. By using image builder, you
                can create these images faster than with manual procedures
                because it eliminates the specific configurations required for
                each output type.
              </Text>
              <br />
              <Text>
                With RPM-DNF, you can manage the system software by using the
                DNF package manager and updated RPM packages. This is a simple
                and adaptive method of managing and modifying the system over
                its lifecycle.
              </Text>
              <br />
              <Text>
                <Button
                  component="a"
                  target="_blank"
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="right"
                  isInline
                  href={
                    'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html-single/managing_software_with_the_dnf_tool/index'
                  }
                >
                  Learn more about managing images with DNF
                </Button>
              </Text>
            </EmptyStateBody>
            <EmptyStateFooter>
              <Link
                to={resolveRelPath('imagewizard')}
                className="pf-c-button pf-m-primary"
                data-testid="create-image-action-empty-state"
              >
                Create image
              </Link>
              <EmptyStateActions>
                <Button
                  component="a"
                  target="_blank"
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="right"
                  isInline
                  href={
                    'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_rhel_images_using_the_image_builder_service'
                  }
                  className="pf-u-pt-md"
                >
                  Image builder for RPM-DNF documentation
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </>
        )}
      </EmptyState>
    </Bullseye>
  );
};
const ImagesEmptyState = ({ selectedBlueprint }: ImagesEmptyStateProps) => {
  if (selectedBlueprint) {
    return <EmptyBlueprintsImagesTable />;
  }
  return <EmptyImagesTable />;
};

export default ImagesEmptyState;
