import React, { useState } from 'react';

import path from 'path';

import {
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
} from '@patternfly/react-core';

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

const AWS_REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'ca-west-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-south-1',
  'eu-south-2',
  'eu-north-1',
  'us-gov-east-1',
  'us-gov-west-1',
];

const isAwsBucketValid = (bucket: string | undefined) => {
  if (bucket === undefined || bucket === '') {
    return true;
  }

  const regex = /^[a-z0-9.-]{3,63}$/;
  return regex.test(bucket);
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
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    setValue(value as string);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      style={
        {
          width: '100%',
        } as React.CSSProperties
      }
    >
      {value}
    </MenuToggle>
  );

  return (
    <FormGroup label="AWS Region">
      <Select
        isOpen={isOpen}
        selected={value}
        onSelect={onSelect}
        onOpenChange={() => setIsOpen(!isOpen)}
        toggle={toggle}
        // TODO: allow user defined items?
      >
        {AWS_REGIONS.map((region) => (
          <SelectOption key={region} value={region}>
            {region}
          </SelectOption>
        ))}
      </Select>
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
