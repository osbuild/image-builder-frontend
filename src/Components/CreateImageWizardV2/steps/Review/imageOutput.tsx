import React from 'react';

import {
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectArchitecture,
  selectDistribution,
} from '../../../../store/wizardSlice';

export const ImageOutputList = () => {
  const release = useAppSelector((state) => selectDistribution(state));
  const arch = useAppSelector((state) => selectArchitecture(state));
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Release
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {RELEASES.get(release)}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Architecture
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{arch}</TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};
