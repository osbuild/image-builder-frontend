import React, { PropsWithChildren } from 'react';

import { Divider, Title } from '@patternfly/react-core';

import { ReviewList } from './ReviewList';

export const ReviewSection = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <>
      <Title headingLevel='h3' size='md' className='pf-v6-u-mb-sm'>
        {title}
      </Title>
      <div className='pf-v6-u-pl-lg'>
        <ReviewList>{children}</ReviewList>
      </div>
      <Divider className='pf-v6-u-my-md' />
    </>
  );
};
