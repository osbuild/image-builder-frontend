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

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeImageSourceType,
  selectImageSourceType,
} from '@/store/slices/wizard';

import CustomImageSource from './CustomImageSource';
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
          <CardBody>Remote images from registry.redhat.io</CardBody>
        </Card>
        <Card
          id='custom-card'
          isSelectable
          isSelected={imageSourceType === 'custom'}
        >
          <CardHeader
            selectableActions={{
              selectableActionId: 'custom-image-source-input',
              selectableActionAriaLabelledby: 'custom-card-title',
              name: 'image-source-type',
              variant: 'single',
              onChange: (_, checked) => {
                if (checked) {
                  dispatch(changeImageSourceType('custom'));
                }
              },
              hasNoOffset: true,
            }}
          >
            <CardTitle id='custom-card-title'>
              Custom images <Label isCompact>No login</Label>
            </CardTitle>
          </CardHeader>
          <CardBody>Local container images</CardBody>
        </Card>
      </Gallery>
      {imageSourceType === 'official' && <OfficialImageSource />}
      {imageSourceType === 'custom' && <CustomImageSource />}
    </FormGroup>
  );
};

export default OnPremImageSourceSelect;
