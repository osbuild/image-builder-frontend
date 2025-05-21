import React, { useEffect, useState } from 'react';

import {
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  Switch,
  TextInput,
} from '@patternfly/react-core';

import { useIsAwsBucketValid, useIsAwsCredsPathValid } from './validators';

import {
  changeAWSBucketName,
  changeAWSConfig,
  changeAWSCredsPath,
  changeAWSRegion,
  selectAWSBucketName,
  selectAWSConfig,
  selectAWSCredsPath,
  selectAWSRegion,
} from '../../store/cloudProviderConfigSlice';
import { WorkerConfigResponse } from '../../store/cockpit/types';
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

type FormGroupProps<T> = {
  value: T | undefined;
  onChange: (value: T) => void;
  isDisabled?: boolean;
};

type ToggleGroupProps = Omit<FormGroupProps<boolean>, 'isDisabled'>;

const AWSConfigToggle = ({ value, onChange }: ToggleGroupProps) => {
  const handleChange = (
    _event: React.FormEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    onChange(checked);
  };

  return (
    <FormGroup label="Configure AWS Uploads">
      <Switch
        id="aws-config-switch"
        ouiaId="aws-config-switch"
        // empty label so there is no icon
        label=""
        isChecked={value}
        onChange={handleChange}
      />
    </FormGroup>
  );
};

const DisabledInputGroup = ({
  value,
  label,
}: {
  value: string | undefined;
  label: string;
}) => {
  return (
    <FormGroup label={label}>
      <TextInput value={value || ''} isDisabled />
    </FormGroup>
  );
};

const AWSBucket = ({ value, onChange, isDisabled }: FormGroupProps<string>) => {
  const isValid = useIsAwsBucketValid();
  const label = 'AWS Bucket';

  if (isDisabled) {
    return <DisabledInputGroup label={label} value={value} />;
  }

  return (
    <FormGroup label={label}>
      <ValidatedInput
        ariaLabel="aws-bucket"
        value={value || ''}
        validator={() => isValid}
        onChange={(_event, value) => onChange(value)}
        helperText="Invalid AWS bucket name"
      />
    </FormGroup>
  );
};

const AWSRegion = ({ value, onChange, isDisabled }: FormGroupProps<string>) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    onChange(value as string);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={!!isDisabled}
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

const AWSCredsPath = ({
  value,
  onChange,
  isDisabled,
}: FormGroupProps<string>) => {
  const isValid = useIsAwsCredsPathValid();
  const label = 'AWS Credentials Filepath';

  if (isDisabled) {
    return <DisabledInputGroup value={value} label={label} />;
  }

  return (
    <FormGroup label={label}>
      <ValidatedInput
        ariaLabel="aws-creds-path"
        value={value || ''}
        validator={() => isValid}
        onChange={(_event, value) => onChange(value)}
        helperText="Invalid filepath for AWS credentials"
      />
    </FormGroup>
  );
};

type AWSConfigProps = {
  refetch: () => Promise<{
    data?: WorkerConfigResponse | undefined;
  }>;
};

export const AWSConfig = ({ refetch }: AWSConfigProps) => {
  const dispatch = useAppDispatch();
  const config = useAppSelector(selectAWSConfig);
  const bucket = useAppSelector(selectAWSBucketName);
  const region = useAppSelector(selectAWSRegion);
  const credentials = useAppSelector(selectAWSCredsPath);
  const [enabled, setEnabled] = useState<boolean>(config !== undefined);

  useEffect(() => {
    if (config) {
      setEnabled(true);
    }
  }, [config]);

  const onToggle = async (v: boolean) => {
    let awsConfig = undefined;
    if (v) {
      const { data } = await refetch();
      awsConfig = data?.aws;
    }
    dispatch(changeAWSConfig(awsConfig));
    setEnabled(v);
  };

  return (
    <Form>
      <AWSConfigToggle value={enabled} onChange={onToggle} />
      <AWSBucket
        value={bucket}
        onChange={(v) => dispatch(changeAWSBucketName(v))}
        isDisabled={!enabled}
      />
      <AWSRegion
        value={region}
        onChange={(v) => dispatch(changeAWSRegion(v))}
        isDisabled={!enabled}
      />
      <AWSCredsPath
        value={credentials}
        onChange={(v) => dispatch(changeAWSCredsPath(v))}
        isDisabled={!enabled}
      />
    </Form>
  );
};
