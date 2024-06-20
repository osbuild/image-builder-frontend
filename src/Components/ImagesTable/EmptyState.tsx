import React from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { EmptyState } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateBody } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateIcon } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateVariant } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateActions } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateHeader } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateFooter } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/plus-circle-icon';
import SearchIcon from '@patternfly/react-icons/dist/dynamic/icons/search-icon';

import {
  CREATING_IMAGES_WITH_IB_SERVICE_URL,
  MANAGING_WITH_DNF_URL,
} from '../../constants';
import { BuildImagesButton } from '../Blueprints/BuildImagesButton';

type ImagesEmptyStateProps = {
  selectedBlueprint?: string;
};

const EmptyBlueprintsImagesTable = () => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
        titleText="No images"
        data-testid="empty-state-header"
      />
      <EmptyStateBody>
        <Text>
          The selected blueprint version doesn&apos;t contain any images. Build
          an image from this version, or adjust the filters.
        </Text>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <BuildImagesButton variant="link">
            Build latest images
          </BuildImagesButton>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </Bullseye>
);

const EmptyImagesTable = () => {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
        <>
          <EmptyStateHeader
            titleText="No images"
            icon={<EmptyStateIcon icon={SearchIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>
            <Text>
              Image builder is a tool for creating deployment-ready customized
              system images: installation disks, virtual machines, cloud
              vendor-specific images, and others. By using image builder, you
              can create these images faster than with manual procedures because
              it eliminates the specific configurations required for each output
              type.
            </Text>
            <Text>
              There are no images yet. Create a blueprint to create images.
            </Text>
            <Text>
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
                href={MANAGING_WITH_DNF_URL}
              >
                Learn more about managing images with DNF
              </Button>
            </Text>
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
                href={CREATING_IMAGES_WITH_IB_SERVICE_URL}
                className="pf-u-pt-md"
              >
                Image builder for RPM-DNF documentation
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </>
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
