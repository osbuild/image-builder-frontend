import React from 'react';

import {
  Button,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Popover,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { AWSUploadConfig, UploadConfigResponse } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAWSBucketName,
  changeAWSCredsPath,
  changeAWSProfile,
  changeAWSRegion,
  reinitializeAWSConfig,
  selectAWSBucketName,
  selectAWSCredsPath,
  selectAWSProfile,
  selectAWSRegion,
} from '@/store/slices/cloudConfig';

import {
  isAwsBucketValid,
  isAwsCredsPathValid,
  isAwsProfileValid,
  isAwsRegionValid,
} from './validators';

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
    <FormGroup label='Configure AWS uploads'>
      <Switch
        id='aws-config-switch'
        ouiaId='aws-config-switch'
        aria-label='aws-config-switch'
        // empty label so there is no icon
        label=''
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
  const dispatch = useAppDispatch();
  const label = 'AWS bucket';

  if (isDisabled) {
    return (
      <DisabledInputGroup label={label} value={value} ariaLabel='aws-bucket' />
    );
  }

  return (
    <FormGroup label={label} isRequired>
      <ValidatedInput
        placeholder='AWS bucket'
        aria-label='aws-bucket'
        value={value || ''}
        validator={isAwsBucketValid}
        onChange={(_event, value) => onChange(value)}
        helperText={
          !value ? 'AWS bucket name is required' : 'Invalid AWS bucket name'
        }
        handleClear={() => dispatch(changeAWSBucketName(''))}
      />
    </FormGroup>
  );
};

const ProfilePopover = () => {
  return (
    <Popover
      minWidth='35rem'
      headerContent={'What is the AWS profile?'}
      bodyContent={
        <Content component={ContentVariants.p}>
          This is the name of the profile in your AWS credentials file which
          contains your AWS access key ID and secret access key. The file is
          typically located at the .aws directory (e.g.
          /home/USERNAME/.aws/credentials).
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant='plain'
        size='sm'
        aria-label='Profile info'
      />
    </Popover>
  );
};

const AWSProfile = ({
  value,
  onChange,
  isDisabled,
}: FormGroupProps<string>) => {
  const dispatch = useAppDispatch();

  const label = (
    <>
      AWS profile <ProfilePopover />
    </>
  );

  if (isDisabled) {
    return (
      <DisabledInputGroup value={value} label={label} ariaLabel='aws-profile' />
    );
  }

  return (
    <FormGroup label={label} isRequired>
      <ValidatedInput
        placeholder='AWS profile in credentials file'
        aria-label='aws-profile'
        value={value || ''}
        validator={isAwsProfileValid}
        onChange={(_event, value) => onChange(value)}
        helperText={!value ? 'AWS profile is required' : 'Invalid AWS profile'}
        handleClear={() => dispatch(changeAWSProfile(''))}
      />
    </FormGroup>
  );
};

const AWSRegion = ({ value, onChange, isDisabled }: FormGroupProps<string>) => {
  const dispatch = useAppDispatch();

  const label = <>AWS region</>;

  if (isDisabled) {
    return (
      <DisabledInputGroup value={value} label={label} ariaLabel='aws-region' />
    );
  }

  return (
    <FormGroup label={label} isRequired>
      <ValidatedInput
        placeholder='AWS region'
        aria-label='aws-region'
        value={value || ''}
        validator={isAwsRegionValid}
        onChange={(_event, value) => onChange(value)}
        helperText={!value ? 'AWS region is required' : 'Invalid AWS region'}
        handleClear={() => dispatch(changeAWSRegion(''))}
      />
    </FormGroup>
  );
};

const CredsPathPopover = () => {
  return (
    <Popover
      minWidth='35rem'
      headerContent={'What is the AWS credentials path?'}
      bodyContent={
        <Content component={ContentVariants.p}>
          This is the path to your AWS credentials file which contains your AWS
          access key ID and secret access key. The file is typically located at
          the .aws directory (e.g. /home/USERNAME/.aws/credentials).
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant='plain'
        size='sm'
        aria-label='Credentials path info'
      />
    </Popover>
  );
};

const AWSCredsPath = ({
  value,
  onChange,
  isDisabled,
}: FormGroupProps<string>) => {
  const dispatch = useAppDispatch();

  const label = (
    <>
      AWS credentials filepath <CredsPathPopover />
    </>
  );

  if (isDisabled) {
    return (
      <DisabledInputGroup
        value={value}
        label={label}
        ariaLabel='aws-creds-path'
      />
    );
  }

  return (
    <FormGroup label={label} isRequired>
      <ValidatedInput
        placeholder='Path to AWS credentials'
        aria-label='aws-creds-path'
        value={value || ''}
        validator={isAwsCredsPathValid}
        onChange={(_event, value) => onChange(value)}
        helperText={
          !value
            ? 'Filepath for AWS credentials is required'
            : 'Invalid filepath for AWS credentials'
        }
        handleClear={() => dispatch(changeAWSCredsPath(''))}
      />
    </FormGroup>
  );
};

type AWSConfigProps = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  reinit: (config: AWSUploadConfig | undefined) => void;
  refetch: () => Promise<{
    data?: UploadConfigResponse | undefined;
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
  const profile = useAppSelector(selectAWSProfile);
  const region = useAppSelector(selectAWSRegion);

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
      <AWSCredsPath
        value={credentials}
        onChange={(v) => dispatch(changeAWSCredsPath(v))}
        isDisabled={!enabled}
      />
      <AWSProfile
        value={profile}
        onChange={(v) => dispatch(changeAWSProfile(v))}
        isDisabled={!enabled}
      />
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
    </Form>
  );
};
