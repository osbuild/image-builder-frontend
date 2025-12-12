import React from 'react';

import {
  Bullseye,
  Button,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  PlusCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';

import { MANAGING_WITH_DNF_URL } from '../../constants';
import { useGetDocumentationUrl } from '../../Hooks';
import { BuildImagesButtonEmptyState } from '../Blueprints/BuildImagesButton';

type ImagesEmptyStateProps = {
  selectedBlueprint?: string;
};

const EmptyBlueprintsImagesTable = () => (
  <Bullseye>
    <EmptyState
      icon={PlusCircleIcon}
      titleText='No images'
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <Content>
          The selected blueprint version doesn&apos;t contain any images. Build
          an image from this version, or adjust the filters.
        </Content>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <BuildImagesButtonEmptyState variant='link'>
            Build latest images
          </BuildImagesButtonEmptyState>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </Bullseye>
);

const EmptyImagesTable = () => {
  const documentationUrl = useGetDocumentationUrl();
  return (
    <Bullseye>
      <EmptyState
        variant={EmptyStateVariant.lg}
        titleText='No images'
        headingLevel='h4'
        icon={SearchIcon}
      >
        <>
          <EmptyStateBody>
            <Content>
              Image builder is a tool for creating deployment-ready customized
              system images: installation disks, virtual machines, cloud
              vendor-specific images, and others. By using image builder, you
              can create these images faster than with manual procedures because
              it eliminates the specific configurations required for each output
              type.
            </Content>
            <Content>
              There are no images yet. Create a blueprint to create images.
            </Content>
            <Content>
              <Button
                component='a'
                target='_blank'
                variant='link'
                icon={<ExternalLinkAltIcon />}
                iconPosition='right'
                isInline
                href={MANAGING_WITH_DNF_URL}
              >
                Learn more about managing images with DNF
              </Button>
            </Content>
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                component='a'
                target='_blank'
                variant='link'
                icon={<ExternalLinkAltIcon />}
                iconPosition='right'
                isInline
                href={documentationUrl}
                className='pf-v6-u-pt-md'
              >
                Image builder documentation
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
