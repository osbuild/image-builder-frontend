import React from 'react';

import {
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';

import { useGetOscapCustomizationsQuery } from '../../../../../store/backendApi';
import { useAppSelector } from '../../../../../store/hooks';
import {
  DistributionProfileItem,
  OpenScap,
  OpenScapProfile,
} from '../../../../../store/imageBuilderApi';
import {
  selectComplianceProfileID,
  selectDistribution,
} from '../../../../../store/wizardSlice';
import { removeBetaFromRelease } from '../removeBetaFromRelease';

const ProfileDetails = (): JSX.Element => {
  const releaseRaw = useAppSelector(selectDistribution);
  const release = removeBetaFromRelease(releaseRaw);
  const profileID = useAppSelector(selectComplianceProfileID);

  const { data, isFetching, error } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      profile: profileID as unknown as DistributionProfileItem,
    },
    { skip: !profileID },
  );

  const oscap = data?.openscap as OpenScap | undefined;
  const isProfile = (value: OpenScap | undefined): value is OpenScapProfile =>
    !!value && 'profile_id' in value;

  const profile = isProfile(oscap) ? oscap : undefined;

  if (isFetching) {
    return <Spinner size='lg' />;
  }

  if (error) {
    return (
      <Content component={ContentVariants.p} className='pf-v6-u-color-200'>
        Unable to load profile information. Please try again.
      </Content>
    );
  }

  return (
    <DescriptionList isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>Profile description</DescriptionListTerm>
        <DescriptionListDescription>
          {profile?.profile_description || '—'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Reference ID</DescriptionListTerm>
        <DescriptionListDescription>
          {profile?.profile_id || profileID}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default ProfileDetails;
