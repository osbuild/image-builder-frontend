import React, { useEffect, useState } from 'react';

import {
  Button,
  Content,
  Form,
  FormGroup,
  Popover,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

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
    checked: boolean,
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
  ariaLabel,
}: {
  value: string | undefined;
  label: React.ReactNode;
  ariaLabel: string;
}) => {
  return (
    <FormGroup label={label}>
      <TextInput aria-label={ariaLabel} value={value || ''} isDisabled />
    </FormGroup>
  );
};

const AWSBucket = ({ value, onChange, isDisabled }: FormGroupProps<string>) => {
  const label = 'AWS Bucket';

  if (isDisabled) {
    return (
      <DisabledInputGroup label={label} value={value} ariaLabel="aws-bucket" />
    );
  }

  return (
    <FormGroup label={label}>
      <ValidatedInput
        placeholder="AWS bucket"
        ariaLabel="aws-bucket"
        value={value || ''}
        validator={isAwsBucketValid}
        onChange={(_event, value) => onChange(value)}
        helperText="Invalid AWS bucket name"
      />
    </FormGroup>
  );
};

const CredsPathPopover = () => {
  return (
    <Popover
      minWidth="35rem"
      headerContent={'What is the AWS Credentials Path?'}
      bodyContent={
        <Content>
          <Content>
            This is the path to your AWS credentials file which contains your
            aws access key id and secret access key. This path to the file is
            normally in the home directory in the credentials file in the .aws
            directory, <br /> i.e. /home/USERNAME/.aws/credentials
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        aria-label="Credentials Path Info"
        className="pf-v6-u-pl-sm header-button"
      />
    </Popover>
  );
};

const AWSCredsPath = ({
  value,
  onChange,
  isDisabled,
}: FormGroupProps<string>) => {
  const label = (
    <>
      AWS Credentials Filepath <CredsPathPopover />
    </>
  );

  if (isDisabled) {
    return (
      <DisabledInputGroup
        value={value}
        label={label}
        ariaLabel="aws-creds-path"
      />
    );
  }

  return (
    <FormGroup label={label}>
      <ValidatedInput
        placeholder="Path to AWS credentials"
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
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  reinit: (config: AWSWorkerConfig | undefined) => void;
  refetch: () => Promise<{
    data?: WorkerConfigResponse | undefined;
  }>;
};

export const AWSConfig = ({
  enabled,
  setEnabled,
  refetch,
  reinit,
}: AWSConfigProps) => {
  const dispatch = useAppDispatch();
  const bucket = useAppSelector(selectAWSBucketName);
  const credentials = useAppSelector(selectAWSCredsPath);

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
