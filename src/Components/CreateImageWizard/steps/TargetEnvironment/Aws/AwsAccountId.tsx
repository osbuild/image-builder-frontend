import React, { useEffect } from 'react';

import {
  Alert,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useGetSourceUploadInfoQuery } from '../../../../../store/provisioningApi';
import {
  changeAwsAccountId,
  selectAwsSourceId,
} from '../../../../../store/wizardSlice';

export const AwsAccountId = () => {
  const dispatch = useAppDispatch();
  const sourceId = useAppSelector(selectAwsSourceId);

  const { data, isError } = useGetSourceUploadInfoQuery(
    {
      id: parseInt(sourceId as string),
    },
    { skip: sourceId === undefined || sourceId === '' },
  );

  useEffect(() => {
    dispatch(changeAwsAccountId(data?.aws?.account_id || ''));
  }, [data?.aws?.account_id, dispatch]);

  return (
    <>
      <FormGroup label='Associated account ID' isRequired>
        <TextInput
          readOnlyVariant='default'
          isRequired
          id='aws-account-id'
          value={sourceId && data ? (data.aws?.account_id ?? '') : ''}
          aria-label='aws account id'
        />
      </FormGroup>
      <HelperText>
        <HelperTextItem component='div' variant='default'>
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
