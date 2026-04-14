import React, { ReactNode } from 'react';

import { Content, FlexItem } from '@patternfly/react-core';

import { DetailsStack } from './DetailsStack';
import { TERM_WIDTH } from './ReviewList';

type FlexColumnProps = {
  heading: string;
  labelKey: string;
  items: string[] | ReactNode[];
};

export const FlexColumn = ({ heading, items, labelKey }: FlexColumnProps) => (
  <FlexItem style={{ flex: `0 0 ${TERM_WIDTH.md}` }}>
    <DetailsStack heading={heading}>
      {items.map((item, index) => (
        <Content key={`${labelKey}-${index}`} component='p'>
          {item}
        </Content>
      ))}
    </DetailsStack>
  </FlexItem>
);
