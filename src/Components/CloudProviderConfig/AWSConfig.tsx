import React from 'react';

import { Form, FormGroup } from '@patternfly/react-core';

import { isAwsBucketValid, isAwsCredsPathValid } from './validators';

import {
  changeAWSBucketName,
  changeAWSCredsPath,
  selectAWSBucketName,
  selectAWSCredsPath,
} from '../../store/cloudProviderConfigSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ValidatedInput } from '../CreateImageWizard/ValidatedInput';

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
      <AWSCredsPath
        value={credentials}
        setValue={(v) => dispatch(changeAWSCredsPath(v))}
      />
    </Form>
  );
};
