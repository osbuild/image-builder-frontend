import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

import { selectFirstBootScript } from '@/store/slices/wizard';

import { useAppSelector } from '../../../../../store/hooks';

export const FirstBootList = () => {
  const isFirstbootEnabled = !!useAppSelector(selectFirstBootScript);

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          First boot script
        </Content>
        <Content component={ContentVariants.dd}>
          {isFirstbootEnabled ? 'Enabled' : 'Disabled'}
        </Content>
      </Content>
    </Content>
  );
};
