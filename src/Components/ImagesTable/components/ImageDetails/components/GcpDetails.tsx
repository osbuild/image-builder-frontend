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
  GcpUploadRequestOptions,
  useGetComposeStatusQuery,
} from '@/store/api/backend';

import {
  isGcpUploadRequestOptions,
  isGcpUploadStatus,
} from '../../../../../store/typeGuards';

export const parseGcpSharedWith = (
  sharedWith: GcpUploadRequestOptions['share_with_accounts'],
) => {
  if (sharedWith) {
    const splitGCPSharedWith = sharedWith[0].split(':');
    return splitGCPSharedWith[1];
  }
};

type GcpDetailsPropTypes = {
  compose: ComposesResponseItem;
};

const GcpDetails = ({ compose }: GcpDetailsPropTypes) => {
  const { data: composeStatus } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const options = compose.request.image_requests[0].upload_request.options;

  if (!isGcpUploadRequestOptions(options)) {
    throw TypeError(
      `Error: options must be of type GcpUploadRequestOptions, not ${typeof options}.`,
    );
  }

  const uploadStatus = composeStatus?.image_status.upload_status?.options;

  if (uploadStatus && !isGcpUploadStatus(uploadStatus)) {
    throw TypeError(
      `Error: uploadStatus must be of type GcpUploadStatus, not ${typeof uploadStatus}.`,
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
        {composeStatus?.image_status.status === 'success' && (
          <DescriptionListGroup>
            <DescriptionListTerm>Project ID</DescriptionListTerm>
            <DescriptionListDescription>
              {uploadStatus?.project_id}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {options.share_with_accounts && (
          <DescriptionListGroup>
            <DescriptionListTerm>Shared with</DescriptionListTerm>
            <DescriptionListDescription>
              {parseGcpSharedWith(options.share_with_accounts)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
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

export default GcpDetails;
