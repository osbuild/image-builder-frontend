import React, { PropsWithChildren } from 'react';

import { Content, Stack, StackItem } from '@patternfly/react-core';

export const DetailsStack = ({
  heading,
  children,
}: PropsWithChildren<{ heading: string }>) => {
  return (
    <Stack className='pf-v6-u-mb-md'>
      <StackItem>
        <Content
          component='p'
          className='pf-v6-u-mb-sm pf-v6-u-font-weight-bold'
        >
          {heading}
        </Content>
        {children}
      </StackItem>
    </Stack>
  );
};
