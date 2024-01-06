import React from 'react';

import {
  Alert,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';

import { useGetSourceUploadInfoQuery } from '../../../../../store/provisioningApi';

import { V1ListSourceResponseItem } from '.';

type AwsAccountIdProps = {
  source: V1ListSourceResponseItem | undefined;
};

export const AwsAccountId = ({ source }: AwsAccountIdProps) => {
  const { data, isError } = useGetSourceUploadInfoQuery(
    {
      id: parseInt(source?.id as string),
    },
    { skip: source === undefined }
  );

  return (
    <>
      <TextInput
        readOnlyVariant="default"
        isRequired
        id="aws-account-id"
        value={data ? data.aws?.account_id : ''}
        aria-label="aws account id"
      />
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
