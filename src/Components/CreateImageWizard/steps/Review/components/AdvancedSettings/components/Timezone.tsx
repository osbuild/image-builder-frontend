import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectNtpServers, selectTimezone } from '@/store/slices';

import { LabelMapper, ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const Timezone = ({ shouldHide }: Hideable) => {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='Timezone'
        description={timezone}
        className={ntpServers && ntpServers.length > 0 ? '' : 'pf-v6-u-mb-md'}
      />
      {ntpServers && ntpServers.length > 0 && (
        <ReviewGroup
          heading='NTP servers'
          description={
            <LabelMapper id='ntp-server-review' items={ntpServers} />
          }
          className='pf-v6-u-mb-md'
        />
      )}
    </>
  );
};
