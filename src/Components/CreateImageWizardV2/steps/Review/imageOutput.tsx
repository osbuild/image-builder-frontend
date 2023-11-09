import React from 'react';

import {
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../constants';
import {
  ArchitectureItem,
  Distributions,
} from '../../../../store/imageBuilderApi';

type ImageOutputListPropTypes = {
  release: Distributions;
  arch: ArchitectureItem['arch'];
};

export const ImageOutputList = ({
  release,
  arch,
}: ImageOutputListPropTypes) => {
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
