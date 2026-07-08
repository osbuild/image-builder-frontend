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

import { MiscFormats, PrivateClouds, PublicClouds } from './components';

import { Users } from '../AdvancedSettings/components';
import { UserGroups } from '../AdvancedSettings/components/UserGroups';
import { ReviewCardHeader, ReviewGroup, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

const ImageOverview = ({ restrictions }: ReviewCardProps) => {
  const imageName = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);
  const imageSource = useAppSelector(selectImageSource);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);

  const environments = useAppSelector(selectImageTypes);
  const { publicClouds, privateClouds, miscFormats } =
    useTargetEnvironmentCategories(environments);

  const releases = isOnPremise ? ON_PREM_RELEASES : RELEASES;

  const release = useMemo(() => {
    if (isImageMode) return imageSource;

    return releases.get(distribution);
  }, [releases, distribution, isImageMode, imageSource]);

  return (
    <Card>
      <ReviewCardHeader
        title='Image overview'
        stepId='base-settings-step'
        sectionId='image-output-section'
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
          <PublicClouds environments={publicClouds} />
          <PrivateClouds environments={privateClouds} />
          <MiscFormats environments={miscFormats} />
          <Users
            shouldHide={
              restrictions.users.shouldHide || !restrictions.users.required
            }
          />
          <UserGroups
            shouldHide={
              restrictions.users.shouldHide || !restrictions.users.required
            }
          />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default ImageOverview;
