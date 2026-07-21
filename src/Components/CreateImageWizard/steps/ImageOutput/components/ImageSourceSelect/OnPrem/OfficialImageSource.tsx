import React, { useMemo } from 'react';

import { useGetRegistryAuthStatusQuery } from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { KNOWN_IMAGES } from '@/store/api/backend/onprem/constants';
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
import RegistryAuth from './RegistryAuth';

const OfficialImageSource = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const selectedRef = useAppSelector(selectImageSource);
  const imageSourceType = useAppSelector(selectImageSourceType);

  const { data: authStatus } = useGetRegistryAuthStatusQuery();
  const isAuthenticated = authStatus?.status === 'authenticated';

  const images = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    return KNOWN_IMAGES.map((known) => ({ ...known, arch }));
  }, [isAuthenticated, arch]);

  if (imageSourceType !== 'official') {
    return null;
  }

  return (
    <>
      <RegistryAuth />
      {isAuthenticated && (
        <ImageSelect
          items={images}
          selectedRef={selectedRef}
          onSelect={(_event, selection) => {
            const selected = images.find((img) => img.reference === selection);
            if (selected) {
              dispatch(changeImageSource(selected.reference));
              dispatch(changeDistribution(selected.distro as Distributions));
              dispatch(
                changeImageTypes([selected.type as SupportedImageTypes]),
              );
            }
          }}
          getLabel={(item) => item.name}
          placeholder={'Select an official image'}
        />
      )}
    </>
  );
};

export default OfficialImageSource;
