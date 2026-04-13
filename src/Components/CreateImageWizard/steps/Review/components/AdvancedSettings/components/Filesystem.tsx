import React from 'react';

import { Label } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectFscMode,
  selectFSConfigurationsCount,
  selectImageMinSize,
} from '@/store/slices';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const Filesystem = ({ shouldHide }: Hideable) => {
  const partitionType = useAppSelector(selectFscMode);
  const minSize = useAppSelector(selectImageMinSize);
  const configurations = useAppSelector(selectFSConfigurationsCount);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='Filesystem configurations'
        className={partitionType !== 'basic' ? 'pf-v6-u-mb-md' : ''}
        description={
          <>
            {configurations > 0 ? configurations : null}
            <Label
              className={configurations > 0 ? 'pf-v6-u-ml-md' : ''}
              color='yellow'
              isCompact
            >
              {partitionType === 'automatic' ? 'Automatic' : 'Manual'}
            </Label>
          </>
        }
      />
      {partitionType !== 'automatic' && minSize && (
        <ReviewGroup
          heading='Image size (minimum)'
          description={minSize < 1 ? 'Less than 1GiB' : `${minSize} GiB`}
          className='pf-v6-u-mb-md'
        />
      )}
    </>
  );
};
