import React, { ReactNode } from 'react';

import { DescriptionList } from '@patternfly/react-core';

export const ReviewList = ({ children }: { children: ReactNode }) => (
  <DescriptionList
    isHorizontal
    horizontalTermWidthModifier={{
      default: '12ch',
      sm: '15ch',
      md: '20ch',
    }}
  >
    {children}
  </DescriptionList>
);
