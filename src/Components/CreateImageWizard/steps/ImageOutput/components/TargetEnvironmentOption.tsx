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

  const isChecked = environments.includes(environment);

  const handleToggle = () => {
    if (isChecked) {
      switch (environment) {
        case 'aws':
          dispatch(reinitializeAws());
          break;
        case 'azure':
          dispatch(reinitializeAzure());
          break;
        case 'gcp':
          dispatch(reinitializeGcp());
      }
      dispatch(removeImageType(environment));
    } else {
      dispatch(addImageType(environment));
    }
  };

  const handleSelect = () => {
    dispatch(changeImageTypes([environment]));
  };

  if (isImageMode) {
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
