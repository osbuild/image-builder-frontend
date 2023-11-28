import React, { useContext } from 'react';

import {
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../constants';
import { ImageWizardContext } from '../../ImageWizardContext';

export const ImageOutputList = () => {
  const { releaseState, architectureState } = useContext(ImageWizardContext);
  const [release] = releaseState;
  const [arch] = architectureState;
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
