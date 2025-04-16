import React, { useState } from 'react';

import { Form, FormGroup, Switch, TextInput } from '@patternfly/react-core';

import { isAwsBucketValid, isAwsCredsPathValid } from './validators';

import {
  changeAWSBucketName,
  changeAWSCredsPath,
  reinitializeAWSConfig,
  selectAWSBucketName,
  selectAWSCredsPath,
} from '../../store/cloudProviderConfigSlice';
import {
  AWSWorkerConfig,
  WorkerConfigResponse,
} from '../../store/cockpit/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ValidatedInput } from '../CreateImageWizard/ValidatedInput';

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
        aria-label="aws-config-switch"
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
      <TextInput aria-label={label} value={value || ''} isDisabled />
    </FormGroup>
  );
};

const AWSBucket = ({ value, onChange, isDisabled }: FormGroupProps<string>) => {
  const label = 'AWS Bucket';

  if (isDisabled) {
    return <DisabledInputGroup label={label} value={value} />;
  }

  return (
    <FormGroup label={label}>
      <ValidatedInput
        ariaLabel="aws-bucket"
        value={value || ''}
        validator={isAwsBucketValid}
        onChange={(_event, value) => onChange(value)}
        helperText="Invalid AWS bucket name"
      />
    </FormGroup>
  );
};

const AWSCredsPath = ({
  value,
  onChange,
  isDisabled,
}: FormGroupProps<string>) => {
  const label = 'AWS Credentials Filepath';

  if (isDisabled) {
    return <DisabledInputGroup value={value} label={label} />;
  }

  return (
    <FormGroup label={label}>
      <ValidatedInput
        ariaLabel="aws-creds-path"
        value={value || ''}
        validator={isAwsCredsPathValid}
        onChange={(_event, value) => onChange(value)}
        helperText="Invalid filepath for AWS credentials"
      />
    </FormGroup>
  );
};

type AWSConfigProps = {
  isEnabled: boolean;
  reinit: (config: AWSWorkerConfig | undefined) => void;
  refetch: () => Promise<{
    data?: WorkerConfigResponse | undefined;
  }>;
};

export const AWSConfig = ({ isEnabled, refetch, reinit }: AWSConfigProps) => {
  const dispatch = useAppDispatch();
  const bucket = useAppSelector(selectAWSBucketName);
  const credentials = useAppSelector(selectAWSCredsPath);
  const [enabled, setEnabled] = useState<boolean>(isEnabled);

  const onToggle = async (v: boolean) => {
    if (v) {
      try {
        const { data } = await refetch();
        reinit(data?.aws);
        setEnabled(v);
        return;
      } catch {
        return;
      }
    }
    dispatch(reinitializeAWSConfig());
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
      <AWSCredsPath
        value={credentials}
        onChange={(v) => dispatch(changeAWSCredsPath(v))}
        isDisabled={!enabled}
      />
    </Form>
  );
};
