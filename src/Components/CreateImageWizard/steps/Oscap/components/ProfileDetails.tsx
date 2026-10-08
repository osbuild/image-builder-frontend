import React from 'react';

import {
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Spinner,
} from '@patternfly/react-core';

import {
  DistributionProfileItem,
  OpenScap,
  OpenScapProfile,
  useGetOscapCustomizationsQuery,
  useSecuritySummary,
} from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  removeBetaFromRelease,
  selectComplianceProfileID,
  selectDistribution,
} from '@/store/slices/wizard';

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

  const { packages, services, kernel, filesystem } = useSecuritySummary();

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
      {packages.length > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>Added packages</DescriptionListTerm>
          <DescriptionListDescription>
            <LabelGroup numLabels={7} aria-label='Added packages'>
              {packages.map((pkg) => (
                <Label variant='outline' key={pkg}>
                  {pkg}
                </Label>
              ))}
            </LabelGroup>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {filesystem.length > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>Included partitioning</DescriptionListTerm>
          <DescriptionListDescription>
            <LabelGroup numLabels={7} aria-label='Included partitioning'>
              {filesystem.map((fs) => (
                <Label variant='outline' key={fs.mountpoint}>
                  {fs.mountpoint}
                </Label>
              ))}
            </LabelGroup>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {kernel.append.length > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>Kernel arguments</DescriptionListTerm>
          <DescriptionListDescription>
            <LabelGroup numLabels={7} aria-label='Kernel arguments'>
              {kernel.append.map((arg) => (
                <Label variant='outline' key={arg}>
                  {arg}
                </Label>
              ))}
            </LabelGroup>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {(services.enabled.length > 0 || services.masked.length > 0) && (
        <DescriptionListGroup>
          <DescriptionListTerm>Systemd services</DescriptionListTerm>
          <DescriptionListDescription>
            {services.enabled.length > 0 && (
              <LabelGroup
                numLabels={7}
                categoryName='Enabled services'
                aria-label='Enabled services'
              >
                {services.enabled.map((svc) => (
                  <Label variant='outline' key={svc}>
                    {svc}
                  </Label>
                ))}
              </LabelGroup>
            )}
            {services.masked.length > 0 && (
              <LabelGroup
                numLabels={7}
                categoryName='Masked services'
                aria-label='Masked services'
              >
                {services.masked.map((svc) => (
                  <Label variant='outline' key={svc}>
                    {svc}
                  </Label>
                ))}
              </LabelGroup>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export default ProfileDetails;
