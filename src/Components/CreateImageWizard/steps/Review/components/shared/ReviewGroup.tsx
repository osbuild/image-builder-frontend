import React, { ReactNode } from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type ReviewGroupProps = {
  heading: string;
  description?: string | ReactNode | undefined;
  className?: string | undefined;
};

export const ReviewGroup = ({
  heading,
  description,
  className = '',
}: ReviewGroupProps) => {
  return (
    <DescriptionListGroup className={className}>
      <DescriptionListTerm>{heading}</DescriptionListTerm>
      <DescriptionListDescription>{description}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};
