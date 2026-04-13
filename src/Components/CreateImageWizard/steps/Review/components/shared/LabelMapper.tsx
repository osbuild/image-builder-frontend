import React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

type LabelMapperProps = {
  id: string;
  emptyMessage?: string | undefined;
  items: string[];
  oscapItems?: string[] | undefined;
  numLabels?: number | undefined;
};

export const LabelMapper = ({
  id,
  emptyMessage,
  items,
  oscapItems: oscap = [],
  numLabels = 7,
}: LabelMapperProps) => {
  // Using a Set for O(1) lookups
  const oscapSet = new Set(oscap);

  return (
    <LabelGroup numLabels={numLabels}>
      {items.map((item, index) => (
        <Label
          color={oscapSet.has(item) ? 'grey' : 'blue'}
          key={`${id}-${index}`}
        >
          {item}
        </Label>
      ))}
      {items.length === 0 && emptyMessage && <Label>{emptyMessage}</Label>}
    </LabelGroup>
  );
};
