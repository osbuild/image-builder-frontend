import React from 'react';

import path from 'path';

import { Form, FormGroup } from '@patternfly/react-core';

import {
  changeAWSBucketName,
  changeAWSCredsPath,
  changeAWSRegion,
  selectAWSBucketName,
  selectAWSCredsPath,
  selectAWSRegion,
} from '../../store/cloudProviderConfigSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ValidatedInput } from '../CreateImageWizard/ValidatedInput';

const isAwsBucketValid = (bucket: string | undefined) => {
  if (bucket === undefined || bucket === '') {
    return true;
  }

  const regex = /^[a-z0-9.-]{3,63}$/;
  return regex.test(bucket);
};

const isAwsRegionValid = (region: string | undefined) => {
  if (region === undefined || region === '') {
    return true;
  }

  // TODO: add more regions
  // Or rather, make the list a select box
  const validRegions = ['us-east-1', 'eu-west-1'];
  return validRegions.includes(region);
};

const isAwsCredsPathValid = (credsPath: string | undefined) => {
  if (credsPath === undefined || credsPath === '') {
    return true;
  }

  const validPathPattern = /^(\/[^/\0]*)+\/?$/;
  return path.isAbsolute(credsPath) && validPathPattern.test(credsPath);
};

type FormGroupProps = {
  value: string | undefined;
  setValue: (value: string) => void;
};

const AWSBucket = ({ value, setValue }: FormGroupProps) => {
  return (
    <FormGroup label="AWS Bucket">
      <ValidatedInput
        ariaLabel="aws-bucket"
        value={value || ''}
        validator={isAwsBucketValid}
        onChange={(_event, value) => setValue(value)}
        helperText="Invalid AWS bucket name"
      />
    </FormGroup>
  );
};

const AWSRegion = ({ value, setValue }: FormGroupProps) => {
  return (
    <FormGroup label="AWS Region">
      <ValidatedInput
        ariaLabel="aws-region"
        value={value || ''}
        validator={isAwsRegionValid}
        onChange={(_event, value) => setValue(value)}
        helperText="Not a valid AWS region"
      />
    </FormGroup>
  );
};

const AWSCredsPath = ({ value, setValue }: FormGroupProps) => {
  return (
    <FormGroup label="AWS Credentials Filepath">
      <ValidatedInput
        ariaLabel="aws-creds-path"
        value={value || ''}
        validator={isAwsCredsPathValid}
        onChange={(_event, value) => setValue(value)}
        helperText="Invalid filepath for AWS credentials"
      />
    </FormGroup>
  );
};

export const AWSConfig = () => {
  const dispatch = useAppDispatch();
  const bucket = useAppSelector(selectAWSBucketName);
  const region = useAppSelector(selectAWSRegion);
  const credentials = useAppSelector(selectAWSCredsPath);

  // TODO: maybe add a radio button to toggle AWS configuration
  // on or off - this might simplify validation & the overall
  // experience

  return (
    <Form>
      <AWSBucket
        value={bucket}
        setValue={(v) => dispatch(changeAWSBucketName(v))}
      />
      <AWSRegion
        value={region}
        setValue={(v) => dispatch(changeAWSRegion(v))}
      />
      <AWSCredsPath
        value={credentials}
        setValue={(v) => dispatch(changeAWSCredsPath(v))}
      />
    </Form>
  );
};
