import React from 'react';

import { Radio } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices';
import {
  changeAwsShareMethod,
  changeImageTypes,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  selectImageTypes,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

type TargetEnvironmentOptionProps = {
  environment: SupportedImageTypes;
  label: React.ReactNode;
  ariaLabel: string;
  body?: React.ReactNode;
};

const TargetEnvironmentOption = ({
  environment,
  label,
  ariaLabel,
  body,
}: TargetEnvironmentOptionProps) => {
  const dispatch = useAppDispatch();
  const environments = useAppSelector(selectImageTypes);
  const isOnPremise = useAppSelector(selectIsOnPremise);

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

  const handleSelect = () => {
    for (const prev of environments) {
      if (prev !== environment) {
        reinitializeCloudProvider(prev);
      }
    }
    if (environment === 'aws') {
      const method = isOnPremise ? 'onprem' : 'manual';
      dispatch(changeAwsShareMethod(method));
    }
    dispatch(changeImageTypes([environment]));
  };

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
};

export default TargetEnvironmentOption;
