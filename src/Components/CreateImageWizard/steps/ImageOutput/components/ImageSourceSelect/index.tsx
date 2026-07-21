import React, { useEffect, useState } from 'react';

import {
  BootcDistributionItem,
  useGetDistributionsQuery,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import {
  isKnownImageRef,
  KNOWN_IMAGES,
} from '@/store/api/backend/onprem/constants';
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
    refetch,
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

    // Don't override a valid selection — check both local and known images
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

  const findKnownImage = (ref: string): BootcDistributionItem | undefined => {
    const known = KNOWN_IMAGES.find((k) => k.reference === ref);
    return known ? { ...known, arch } : undefined;
  };

  // Resolve selectedItem from local images or known images
  const selectedItem =
    bootcDistributions?.find((d) => d.reference === imageSource) ??
    (imageSource ? findKnownImage(imageSource) : undefined);

  const onSelect = (_event?: React.MouseEvent, selection?: string | number) => {
    dispatch(changeImageSource(selection as string));
    const selected =
      bootcDistributions?.find((d) => d.reference === selection) ??
      findKnownImage(selection as string);
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
      onRefresh={() => refetch()}
    />
  );
};

export default ImageSourceSelect;
