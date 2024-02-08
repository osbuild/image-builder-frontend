import React from 'react';

import {
  Alert,
  HelperText,
  HelperTextItem,
  TextInput,
  FormGroup,
} from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import { useGetSourceUploadInfoQuery } from '../../../../../store/provisioningApi';
import { selectAwsSource } from '../../../../../store/wizardSlice';

export const AwsAccountId = () => {
  const source = useAppSelector((state) => selectAwsSource(state));

  const { data, isError } = useGetSourceUploadInfoQuery(
    {
      id: parseInt(source?.id as string),
    },
    { skip: source === undefined }
  );

  return (
    <>
      <FormGroup label="Associated Account ID" isRequired>
        <TextInput
          readOnlyVariant="default"
          isRequired
          id="aws-account-id"
          value={source && data ? data.aws?.account_id : ''}
          aria-label="aws account id"
        />
      </FormGroup>
      <HelperText>
        <HelperTextItem component="div" variant="indeterminate">
          This is the account associated with the source.
        </HelperTextItem>
      </HelperText>
      {isError && (
        <Alert
          variant={'danger'}
          isPlain
          isInline
          title={'AWS details unavailable'}
        >
          The AWS account ID for the selected source could not be resolved.
          There might be a problem with the source. Verify that the source is
          valid in Sources or select a different source.
        </Alert>
      )}
    </>
  );
};
