import React, { Dispatch, SetStateAction } from 'react';

import { extractProvisioningList } from '../../../../store/helpers';
import {
  useGetSourceListQuery,
  useGetSourceUploadInfoQuery,
} from '../../../../store/provisioningApi';
import TypeAheadSelect from '../../common/TypeAheadSelect';

/**
 * @return unpacked data for the given provide.
 *  - For aws: accountId
 *  - For azure: tenantId and subscriptionId
 * is error is set to true if anything went wrong fetching data.
 */
export const useGetAccountData = (
  sourceId: number,
  provider: 'aws' | 'azure'
) => {
  const { data, isError } = useGetSourceUploadInfoQuery(
    { id: sourceId },
    {
      skip: !sourceId,
    }
  );
  if (!sourceId) {
    return {
      accountId: '',
      tenantId: '',
      subscriptionId: '',
      resourceGroups: [],
      isError: false,
    };
  }
  switch (provider) {
    case 'aws':
      return {
        accountId: data?.aws?.account_id ? data.aws.account_id : '',
        tenantId: '',
        subscriptionId: '',
        resourceGroups: [],
        isError: isError,
      };
    case 'azure':
      return {
        accountId: '',
        tenantId: data?.azure?.tenant_id ? data.azure.tenant_id : '',
        subscriptionId: data?.azure?.subscription_id
          ? data.azure.subscription_id
          : '',
        resourceGroups: data?.azure?.resource_groups
          ? data.azure.resource_groups
          : [],
        isError: isError,
      };
  }
};

type SourcesSelectPropType = {
  provider: 'aws' | 'azure' | 'gcp';
  selectedSource: [number, string];
  setSelectedSource: Dispatch<SetStateAction<[number, string]>>;
};

/**
 * Component to allow the user to select a source (id and label) through a
 * TypeAheadSelect component.
 *
 * @param provider azure or aws depending on the context
 * @param selectedSource the source the user has selected from the select menue
 * @param setSelectedSource a function to update the selected source
 * source ended up in an error.
 */
export const SourcesSelect = ({
  provider,
  selectedSource,
  setSelectedSource,
}: SourcesSelectPropType) => {
  const {
    data: rawSources,
    isFetching,
    isError,
    refetch,
  } = useGetSourceListQuery({ provider: provider });

  const sources =
    rawSources !== undefined ? extractProvisioningList(rawSources) : [];
  const options: [number, string][] = [];
  sources?.forEach((val) => {
    if (val.id && val.name) {
      options.push([parseInt(val.id), val.name]);
    }
  });
  return (
    <TypeAheadSelect
      inputOptions={options}
      fieldID="source-"
      selected={selectedSource}
      setSelected={setSelectedSource}
      placeholderText="Select a source"
      isFetching={isFetching}
      isError={isError}
      refetch={refetch}
    />
  );
};
