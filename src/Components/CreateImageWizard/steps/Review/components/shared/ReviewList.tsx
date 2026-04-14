import React, { ReactNode } from 'react';

import { DescriptionList } from '@patternfly/react-core';

// Term widths per breakpoint, used to align multi-column layouts with the description list
export const TERM_WIDTH = {
  default: '12ch',
  sm: '15ch',
  md: '20ch',
};

export const ReviewList = ({ children }: { children: ReactNode }) => (
  <DescriptionList isHorizontal horizontalTermWidthModifier={TERM_WIDTH}>
    {children}
  </DescriptionList>
);
