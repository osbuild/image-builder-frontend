import React from 'react';

import { Checkbox, Radio } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addImageType,
  changeImageTypes,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  removeImageType,
  selectImageTypes,
  selectIsImageMode,
  selectUseSingleTarget,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

type TargetEnvironmentOptionProps = {
  environment: SupportedImageTypes;
  label: React.ReactNode;
  ariaLabel: string;
  body?: React.ReactNode;
  isDisabled?: boolean;
};

const TargetEnvironmentOption = ({
  environment,
  label,
  ariaLabel,
  body,
  isDisabled,
}: TargetEnvironmentOptionProps) => {
  const dispatch = useAppDispatch();
  const environments = useAppSelector(selectImageTypes);
  const isImageMode = useAppSelector(selectIsImageMode);
  const useSingleTarget = useAppSelector(selectUseSingleTarget);

  const isChecked = environments.includes(environment);

  const reinitializeCloudProvider = (env: SupportedImageTypes) => {
    switch (env) {
      case 'aws':
        dispatch(reinitializeAws());
        break;
      case 'azure':
        dispatch(reinitializeAzure());
        break;
      case 'gcp':
        dispatch(reinitializeGcp());
        break;
    }
  };

  const handleToggle = () => {
    if (isChecked) {
      reinitializeCloudProvider(environment);
      dispatch(removeImageType(environment));
    } else {
      dispatch(addImageType(environment));
    }
  };

  const handleSelect = () => {
    for (const prev of environments) {
      if (prev !== environment) {
        reinitializeCloudProvider(prev);
      }
    }
    dispatch(changeImageTypes([environment]));
  };

  if (isImageMode || useSingleTarget) {
    return (
      <Radio
        className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
        id={`radio-${environment}`}
        name='target-environment'
        label={label}
        aria-label={ariaLabel}
        isChecked={isChecked}
        onChange={handleSelect}
        body={isChecked ? body : undefined}
      />
    );
  }

  return (
    <Checkbox
      className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
      id={`checkbox-${environment}`}
      isLabelWrapped
      name={ariaLabel}
      label={label}
      aria-label={`${ariaLabel} checkbox`}
      isChecked={isChecked}
      isDisabled={isDisabled}
      onChange={handleToggle}
      body={isChecked ? body : undefined}
    />
  );
};

export default TargetEnvironmentOption;
