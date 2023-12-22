import React, { useEffect, useState } from 'react';

import { Alert } from '@patternfly/react-core';
import { FormGroup, Spinner } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import { extractProvisioningList } from '../../../../store/helpers';
import { useAppDispatch } from '../../../../store/hooks';
import {
  useGetSourceListQuery,
  useGetSourceUploadInfoQuery,
} from '../../../../store/provisioningApi';
import { changeAwsAccountId } from '../../../../store/wizardSlice';

type V1ListSourceResponseItem = {
  id?: string;
  name?: string;
  source_type_id?: string;
  uid?: string;
};

export const AWSSourcesSelect = () => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<V1ListSourceResponseItem | undefined>(
    undefined
  );

  const { data, isFetching, isSuccess, isError, refetch } =
    useGetSourceListQuery({ provider: 'aws' });

  const sources = data?.data;

  const {
    data: sourceDetails,
    isFetching: isFetchingDetails,
    isSuccess: isSuccessDetails,
    isError: isErrorDetails,
  } = useGetSourceUploadInfoQuery(
    { id: parseInt(source?.id) },
    {
      skip: !source,
    }
  );

  useEffect(() => {
    dispatch(changeAwsAccountId(sourceDetails?.aws?.account_id));
  }, [dispatch, sourceDetails]);

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    value: string
  ) => {
    const source = sources.find((source) => source.name === value);
    setSource(source);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSource(undefined);
    dispatch(changeAwsAccountId(undefined));
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };

  return (
    <>
      <FormGroup isRequired label={'Source Name'} data-testid="sources">
        <Select
          ouiaId="source_select"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          selections={source?.name}
          isOpen={isOpen}
          placeholderText="Select source"
          typeAheadAriaLabel="Select source"
          isDisabled={!isSuccess}
        >
          {sources.map((source) => (
            <SelectOption key={source.id} value={source.name} />
          ))}
          {/*isFetching && (
            <SelectOption isNoResultsOption={true}>
              <Spinner size="lg" />
            </SelectOption>
          )*/}
        </Select>
      </FormGroup>
      <>
        {isError && (
          <Alert
            variant={'danger'}
            isPlain={true}
            isInline={true}
            title={'Sources unavailable'}
          >
            Sources cannot be reached, try again later or enter an AWS account
            ID manually.
          </Alert>
        )}
        {!isError && isErrorDetails && (
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
    </>
  );
};
