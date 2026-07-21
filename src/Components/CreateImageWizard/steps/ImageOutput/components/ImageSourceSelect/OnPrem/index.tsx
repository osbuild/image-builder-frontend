import React, { useEffect, useMemo } from 'react';

import { FormGroup, Radio } from '@patternfly/react-core';

import {
  type BootcDistributionItem,
  useBackendPrefetch,
  useGetRegistryAuthStatusQuery,
} from '@/store/api/backend';
import {
  isKnownImageRef,
  KNOWN_IMAGES,
} from '@/store/api/backend/onprem/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeImageSourceType,
  selectArchitecture,
  selectImageSourceType,
} from '@/store/slices/wizard';

import CustomImageSource from './CustomImageSource';
import OfficialImageSource from './OfficialImageSource';

import ImageSourceError from '../ImageSourceError';

type OnPremImageSourceSelectProps = {
  distributions: BootcDistributionItem[] | undefined;
  selectedItem: BootcDistributionItem | undefined;
  isLoading: boolean;
  isError: boolean;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  onRefresh: () => void;
};

const OnPremImageSourceSelect = ({
  distributions,
  selectedItem,
  isLoading,
  isError,
  onSelect,
  onRefresh,
}: OnPremImageSourceSelectProps) => {
  const dispatch = useAppDispatch();
  const imageSourceType = useAppSelector(selectImageSourceType);
  const arch = useAppSelector(selectArchitecture);

  // Prefetch registry auth status so it's ready when the user
  // opens the official radio — avoids a "checking" spinner.
  const prefetchAuthStatus = useBackendPrefetch('getRegistryAuthStatus');
  useEffect(() => {
    prefetchAuthStatus(undefined);
  }, [prefetchAuthStatus]);

  const { data: authStatus } = useGetRegistryAuthStatusQuery();
  const isAuthenticated = authStatus?.status === 'authenticated';

  const { officialImages, customImages } = useMemo(() => {
    const local = distributions ?? [];
    if (!isAuthenticated) {
      return {
        officialImages: [] as BootcDistributionItem[],
        customImages: local,
      };
    }
    return {
      officialImages: KNOWN_IMAGES.map((known) => ({ ...known, arch })),
      customImages: local.filter((img) => !isKnownImageRef(img.reference)),
    };
  }, [isAuthenticated, distributions, arch]);

  return (
    <FormGroup label='Image source' isRequired>
      {isError && <ImageSourceError isOnPremise />}
      <Radio
        id='radio-official'
        name='image-source-type'
        label='Official Red Hat images'
        aria-label='Official Red Hat images'
        isChecked={imageSourceType === 'official'}
        onChange={() => dispatch(changeImageSourceType('official'))}
        body={
          <OfficialImageSource
            images={officialImages}
            selectedRef={selectedItem?.reference}
            isLoading={isLoading}
            onSelect={onSelect}
            onRefresh={onRefresh}
          />
        }
        className='pf-v6-u-mb-sm'
      />
      <Radio
        id='radio-custom'
        name='image-source-type'
        label='Custom images'
        aria-label='Custom images'
        isChecked={imageSourceType === 'custom'}
        onChange={() => dispatch(changeImageSourceType('custom'))}
        body={
          <CustomImageSource
            images={customImages}
            selectedRef={selectedItem?.reference}
            isLoading={isLoading}
            onSelect={onSelect}
            onRefresh={onRefresh}
          />
        }
        className='pf-v6-u-mb-sm'
      />
    </FormGroup>
  );
};

export default OnPremImageSourceSelect;
