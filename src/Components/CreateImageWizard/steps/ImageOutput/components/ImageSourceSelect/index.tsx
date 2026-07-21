import React, { useEffect, useState } from 'react';

import {
  BootcDistributionItem,
  useGetDistributionsQuery,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { isKnownImageRef } from '@/store/api/backend/onprem/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeBootcDistributions,
  changeDistribution,
  changeImageSource,
  changeImageTypes,
  selectArchitecture,
  selectImageSource,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

import ImageSourceDropdown from './Dropdown';

const ImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const arch = useAppSelector(selectArchitecture);
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: distributions,
    isLoading,
    isError,
  } = useGetDistributionsQuery({ kind: 'bootc', arch });

  const bootcDistributions = distributions as
    BootcDistributionItem[] | undefined;

  useEffect(() => {
    if (bootcDistributions) {
      dispatch(changeBootcDistributions(bootcDistributions));
    }
  }, [bootcDistributions, dispatch]);

  useEffect(() => {
    if (!bootcDistributions || bootcDistributions.length === 0) return;

    const hasSelected = imageSource
      ? bootcDistributions.some((d) => d.reference === imageSource) ||
        isKnownImageRef(imageSource)
      : false;
    if (hasSelected) return;

    const defaultItem =
      bootcDistributions.find((d) => d.distro.startsWith('rhel-10')) ??
      bootcDistributions[0];

    dispatch(changeImageSource(defaultItem.reference));
    dispatch(changeDistribution(defaultItem.distro as Distributions));
  }, [bootcDistributions, dispatch, imageSource]);

  const selectedItem = bootcDistributions?.find(
    (d) => d.reference === imageSource,
  );

  const onSelect = (_event?: React.MouseEvent, selection?: string | number) => {
    dispatch(changeImageSource(selection as string));
    const selected = bootcDistributions?.find((d) => d.reference === selection);
    if (selected) {
      dispatch(changeDistribution(selected.distro as Distributions));
      if (isOnPremise) {
        dispatch(changeImageTypes([selected.type as SupportedImageTypes]));
      }
    }
    setIsOpen(false);
  };

  return (
    <ImageSourceDropdown
      distributions={bootcDistributions}
      selectedItem={selectedItem}
      isLoading={isLoading}
      isError={isError}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onOpenChange={(open) => setIsOpen(open)}
      onSelect={onSelect}
    />
  );
};

export default ImageSourceSelect;
