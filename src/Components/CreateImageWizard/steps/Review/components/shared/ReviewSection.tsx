import React, { PropsWithChildren } from 'react';

import { Divider, Title } from '@patternfly/react-core';

import { ReviewList } from './ReviewList';

type ReviewSectionProps = {
  title: string;
  shouldHide?: boolean;
};

export const ReviewSection = ({
  title,
  shouldHide,
  children,
}: PropsWithChildren<ReviewSectionProps>) => {
  if (shouldHide) {
    return null;
  }

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
