import React, { useMemo } from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { ON_PREM_RELEASES, RELEASES } from '@/constants';
import { useTargetEnvironmentCategories } from '@/Hooks';
import { useAppSelector } from '@/store/hooks';
import {
  selectArchitecture,
  selectBlueprintDescription,
  selectBlueprintName,
  selectDistribution,
  selectImageSource,
  selectImageTypes,
  selectIsImageMode,
  selectIsOnPremise,
} from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { MiscFormats, PrivateClouds, PublicClouds } from './components';

import { ReviewCardHeader, ReviewGroup, ReviewList } from '../shared';

const ImageOverview = () => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const imageName = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);
  const imageSource = useAppSelector(selectImageSource);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);

  const { publicClouds, privateClouds, miscFormats } =
    useTargetEnvironmentCategories(useAppSelector(selectImageTypes));

  const releases = isOnPremise ? ON_PREM_RELEASES : RELEASES;

  const release = useMemo(() => {
    if (isImageMode) return imageSource;

    return releases.get(distribution);
  }, [releases, distribution, isImageMode, imageSource]);

  return (
    <Card>
      <ReviewCardHeader
        title='Image overview'
        stepId={
          isWizardRevampEnabled ? 'base-settings-step' : 'step-image-output'
        }
        {...(isWizardRevampEnabled && { sectionId: 'image-output-section' })}
      />
      <CardBody>
        <ReviewList>
          <ReviewGroup heading='Name' description={imageName} />
          {description && (
            <ReviewGroup heading='Details' description={description} />
          )}
          {
            // TODO: the author line item isn't supported in the
            // backend yet, so we can't show this just yet
          }
          <ReviewGroup
            heading={!isImageMode ? 'Base release' : 'Image'}
            description={release}
          />
          <ReviewGroup
            className='pf-v6-u-mb-md'
            heading='Architecture'
            description={arch}
          />
          <ReviewGroup heading='Target environments' />
          <PrivateClouds environments={privateClouds} />
          <PublicClouds environments={publicClouds} />
          <MiscFormats environments={miscFormats} />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default ImageOverview;
