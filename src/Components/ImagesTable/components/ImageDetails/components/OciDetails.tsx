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

import { isOciUploadStatus } from '../../../../../store/typeGuards';

type OciDetailsPropTypes = {
  compose: ComposesResponseItem;
};

const OciDetails = ({ compose }: OciDetailsPropTypes) => {
  const { data: composeStatus } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const options = composeStatus?.image_status.upload_status?.options;

  if (options && !isOciUploadStatus(options)) {
    throw TypeError(
      `Error: uploadStatus must be of type OciUploadStatus, not ${typeof options}.`,
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
      </DescriptionList>
      <br />
      <div className='pf-v6-u-font-weight-bold pf-v6-u-pb-md'>
        Cloud Provider Identifiers
      </div>
      <DescriptionList isHorizontal isCompact className=' pf-v6-u-pl-xl'>
        <DescriptionListGroup>
          <DescriptionListTerm>Object Storage URL</DescriptionListTerm>
          <DescriptionListDescription>
            {composeStatus?.image_status.status === 'success' && (
              <ClipboardCopy
                hoverTip='Copy'
                clickTip='Copied'
                variant='inline-compact'
                isBlock
              >
                {options?.url || ''}
              </ClipboardCopy>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

export default OciDetails;
