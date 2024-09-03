import React from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Text,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, SearchIcon } from '@patternfly/react-icons';

import {
  CREATING_IMAGES_WITH_IB_SERVICE_URL,
  MANAGING_WITH_DNF_URL,
} from '../../constants';

export const EmptyImagesTable = () => {
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
