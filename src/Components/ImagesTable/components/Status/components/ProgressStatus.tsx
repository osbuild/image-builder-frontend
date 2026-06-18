import React from 'react';

import { Flex } from '@patternfly/react-core';

import { ComposeStatus } from '@/store/api/backend';

import { statuses } from '../statusConfig';

type ProgressStatusPropTypes = {
  status: ComposeStatus;
};

const ProgressStatus = ({ status }: ProgressStatusPropTypes) => {
  const icon = statuses[status.image_status.status].icon;
  const text = statuses[status.image_status.status].text;
  const progress = status.image_status.progress;

  let progressText = '';
  let subprogressText = '';
  if (progress) {
    progressText = `step ${progress.done} of ${progress.total}`;
    if (progress.subprogress) {
      subprogressText = `(substep ${progress.subprogress.done} of ${progress.subprogress.total})`;
    }
  }

  return (
    <Flex className='pf-v6-u-align-items-baseline pf-m-nowrap'>
      <div className='pf-v6-u-mr-sm'>{icon}</div>
      <p>
        {text}
        {progressText && <br />}
        {progressText} {subprogressText}
      </p>
    </Flex>
  );
};

export default ProgressStatus;
