import React from 'react';

import { Content } from '@patternfly/react-core';

import type { PrivateCloudType } from '@/Hooks/Utilities/useTargetEnvironmentCategories';

import { ReviewGroup } from '../../shared';

const PRIVATE_CLOUDS: Record<PrivateCloudType, string> = {
  vsphere: 'VMware vSphere (.vmdk)',
  'vsphere-ova': 'VMware vSphere (.ova)',
};

export const PrivateClouds = ({
  environments,
}: {
  environments: PrivateCloudType[];
}) => {
  if (environments.length === 0) {
    return null;
  }

  return (
    <ReviewGroup
      className='pf-v6-u-mb-md'
      heading='Private cloud'
      description={
        <>
          {environments.map((cloud) => (
            <Content component='p' key={cloud}>
              {PRIVATE_CLOUDS[cloud]}
            </Content>
          ))}
        </>
      }
    />
  );
};
