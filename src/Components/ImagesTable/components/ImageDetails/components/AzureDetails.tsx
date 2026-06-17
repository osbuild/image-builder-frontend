import React from 'react';

import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '@/store/api/backend';

import {
  isAzureUploadRequestOptions,
  isAzureUploadStatus,
} from '../../../../../store/typeGuards';

type AzureDetailsPropTypes = {
  compose: ComposesResponseItem;
};

const AzureDetails = ({ compose }: AzureDetailsPropTypes) => {
  const { data: composeStatus } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const options = compose.request.image_requests[0].upload_request.options;

  if (!isAzureUploadRequestOptions(options)) {
    throw TypeError(
      `Error: options must be of type AzureUploadRequestOptions, not ${typeof options}.`,
    );
  }

  const resourceGroup = options.resource_group;

  const uploadStatus = composeStatus?.image_status.upload_status?.options;

  if (uploadStatus && !isAzureUploadStatus(uploadStatus)) {
    throw TypeError(
      `Error: uploadStatus must be of type AzureUploadStatus, not ${typeof uploadStatus}.`,
    );
  }

  return (
    <>
      <div className='pf-v6-u-font-weight-bold pf-v6-u-pb-md'>
        Build Information
      </div>
      <DescriptionList isHorizontal isCompact className=' pf-v6-u-pl-xl'>
        <DescriptionListGroup>
          <DescriptionListTerm>UUID</DescriptionListTerm>
          <DescriptionListDescription>
            <ClipboardCopy
              hoverTip='Copy'
              clickTip='Copied'
              variant='inline-compact'
            >
              {compose.id}
            </ClipboardCopy>
          </DescriptionListDescription>
          <DescriptionListTerm>Architecture</DescriptionListTerm>
          <DescriptionListDescription>
            {compose.request.image_requests[0].architecture}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Resource Group</DescriptionListTerm>
          <DescriptionListDescription>
            {resourceGroup}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      <br />
      <div className='pf-v6-u-font-weight-bold pf-v6-u-pb-md'>
        Cloud Provider Identifiers
      </div>
      <DescriptionList isHorizontal isCompact className=' pf-v6-u-pl-xl'>
        <DescriptionListGroup>
          <DescriptionListTerm>Image name</DescriptionListTerm>
          <DescriptionListDescription>
            {composeStatus?.image_status.status === 'success' && (
              <ClipboardCopy
                hoverTip='Copy'
                clickTip='Copied'
                variant='inline-compact'
              >
                {uploadStatus?.image_name || ''}
              </ClipboardCopy>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

export default AzureDetails;
