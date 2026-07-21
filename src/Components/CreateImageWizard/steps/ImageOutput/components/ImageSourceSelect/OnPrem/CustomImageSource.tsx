import React, { useMemo } from 'react';

import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import {
  type BootcDistributionItem,
  useGetDistributionsQuery,
  useGetRegistryAuthStatusQuery,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { isKnownImageRef } from '@/store/api/backend/onprem/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeDistribution,
  changeImageSource,
  changeImageTypes,
  selectArchitecture,
  selectImageSource,
  selectImageSourceType,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

import ImageSelect from './ImageSelect';

import ImageSourceError from '../ImageSourceError';

const CustomImageSource = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const selectedRef = useAppSelector(selectImageSource);
  const imageSourceType = useAppSelector(selectImageSourceType);

  const { data: authStatus } = useGetRegistryAuthStatusQuery();
  const isAuthenticated = authStatus?.status === 'authenticated';

  const {
    data: distributions,
    isLoading,
    isError,
    refetch,
  } = useGetDistributionsQuery({
    kind: 'bootc',
    arch,
  });

  const images = useMemo(() => {
    const imgs = (distributions ?? []) as BootcDistributionItem[];
    if (!isAuthenticated) {
      return imgs;
    }

    return imgs.filter((img) => !isKnownImageRef(img.reference));
  }, [isAuthenticated, distributions]);

  if (imageSourceType !== 'custom') {
    return null;
  }

  return (
    <>
      {isError && <ImageSourceError isOnPremise />}
      <Flex>
        <FlexItem>
          <ImageSelect
            items={images}
            selectedRef={selectedRef}
            onSelect={(_event, selection) => {
              const selected = images.find(
                (img) => img.reference === selection,
              );
              if (selected) {
                dispatch(changeImageSource(selected.reference));
                dispatch(changeDistribution(selected.distro as Distributions));
                dispatch(
                  changeImageTypes([selected.type as SupportedImageTypes]),
                );
              }
            }}
            getLabel={(item) => item.reference}
            placeholder='Select a custom image'
            isLoading={isLoading}
            isSearchable
          />
        </FlexItem>
        <FlexItem>
          <Button
            variant='plain'
            icon={<SyncAltIcon />}
            onClick={refetch}
            isDisabled={isLoading}
            isInline
            aria-label='Refresh image sources'
          />
        </FlexItem>
      </Flex>
    </>
  );
};

export default CustomImageSource;
