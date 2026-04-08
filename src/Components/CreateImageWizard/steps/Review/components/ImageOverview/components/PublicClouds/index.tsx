import React from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import { PublicCloudType } from '@/Hooks/Utilities/useTargetEnvironmentCategories';

import { AWSDetails } from './AWSDetails';
import { AzureDetails } from './AzureDetails';
import { GCPDetails } from './GCPDetails';
import { OCIDetails } from './OCIDetails';

import { ReviewGroup } from '../../../shared';

type CloudComponentLookup = Partial<
  Record<PublicCloudType, React.ComponentType>
>;

const CLOUD_COMPONENTS: CloudComponentLookup = {
  aws: AWSDetails,
  ami: AWSDetails,
  gcp: GCPDetails,
  azure: AzureDetails,
  vhd: AzureDetails,
  oci: OCIDetails,
};

export const PublicClouds = ({
  environments,
}: {
  environments: PublicCloudType[];
}) => {
  const items = environments.filter((env) => env in CLOUD_COMPONENTS);

  if (items.length === 0) return null;

  const mid = Math.ceil(items.length / 2);

  if (environments.length === 0) return null;

  return (
    <ReviewGroup
      className='pf-v6-u-mb-md'
      heading='Public cloud'
      description={
        // NOTE: we're doing this to achieve the same effect in the UX mocks.
        // However, this will be simplified quite significantly if/when we
        // switch over to single target image building
        <Flex>
          {[items.slice(0, mid), items.slice(mid)].map((column, colIndex) => (
            <FlexItem key={colIndex} flex={{ default: 'flex_1' }}>
              {column.map((env) => {
                const Component = CLOUD_COMPONENTS[env]!;
                return <Component key={env} />;
              })}
            </FlexItem>
          ))}
        </Flex>
      }
    />
  );
};
