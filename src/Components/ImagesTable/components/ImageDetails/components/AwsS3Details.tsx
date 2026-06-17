import React from 'react';

import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { ComposesResponseItem } from '@/store/api/backend';

type AwsS3DetailsPropTypes = {
  compose: ComposesResponseItem;
};

const AwsS3Details = ({ compose }: AwsS3DetailsPropTypes) => {
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
    </>
  );
};

export default AwsS3Details;
