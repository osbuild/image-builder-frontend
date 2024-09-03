import React from 'react';

import {
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
import { PlusCircleIcon } from '@patternfly/react-icons';

import { EmptyImagesTable } from './SharedEmptyState';

import { BuildImagesButtonEmptyState } from '../Blueprints/BuildImagesButton';

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
          <BuildImagesButtonEmptyState variant="link">
            Build latest images
          </BuildImagesButtonEmptyState>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </Bullseye>
);

const ImagesEmptyState = ({ selectedBlueprint }: ImagesEmptyStateProps) => {
  if (selectedBlueprint) {
    return <EmptyBlueprintsImagesTable />;
  }
  return <EmptyImagesTable />;
};

export default ImagesEmptyState;
