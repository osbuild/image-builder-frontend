import React from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  Gallery,
  Label,
} from '@patternfly/react-core';

import { IMAGE_REGISTRY_HOST } from '@/store/api/backend/onprem/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeImageSourceType,
  selectImageSourceType,
} from '@/store/slices/wizard';

import LocalImageSource from './LocalImageSource';
import OfficialImageSource from './OfficialImageSource';

const OnPremImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const imageSourceType = useAppSelector(selectImageSourceType);

  return (
    <FormGroup label='Image source' isRequired>
      <Gallery hasGutter minWidths={{ default: '20rem' }}>
        <Card
          id='official-card'
          isSelectable
          isSelected={imageSourceType === 'official'}
        >
          <CardHeader
            selectableActions={{
              selectableActionId: 'official-image-source-input',
              selectableActionAriaLabelledby: 'official-card-title',
              name: 'image-source-type',
              variant: 'single',
              onChange: (_, checked) => {
                if (checked) {
                  dispatch(changeImageSourceType('official'));
                }
              },
              hasNoOffset: true,
            }}
          >
            <CardTitle id='official-card-title'>
              Official Red Hat images <Label isCompact>Login required</Label>
            </CardTitle>
          </CardHeader>
          <CardBody>Remote images from {IMAGE_REGISTRY_HOST}</CardBody>
        </Card>
        <Card
          id='local-card'
          isSelectable
          isSelected={imageSourceType === 'local'}
        >
          <CardHeader
            selectableActions={{
              selectableActionId: 'local-image-source-input',
              selectableActionAriaLabelledby: 'local-card-title',
              name: 'image-source-type',
              variant: 'single',
              onChange: (_, checked) => {
                if (checked) {
                  dispatch(changeImageSourceType('local'));
                }
              },
              hasNoOffset: true,
            }}
          >
            <CardTitle id='local-card-title'>Local images</CardTitle>
          </CardHeader>
          <CardBody>Local container images</CardBody>
        </Card>
      </Gallery>
      {imageSourceType === 'official' && <OfficialImageSource />}
      {imageSourceType === 'local' && <LocalImageSource />}
    </FormGroup>
  );
};

export default OnPremImageSourceSelect;
