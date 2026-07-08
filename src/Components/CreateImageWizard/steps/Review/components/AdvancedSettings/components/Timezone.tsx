import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectNtpServers, selectTimezone } from '@/store/slices';

import { LabelMapper, ReviewGroup, ReviewSection } from '../../shared';
import { Hideable } from '../../types';

export const Timezone = ({ shouldHide }: Hideable) => {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);

  if (shouldHide) {
    return null;
  }

  return (
    <ReviewSection title='Timezone'>
      <ReviewGroup heading='Timezone' description={timezone} />
      {ntpServers && ntpServers.length > 0 && (
        <ReviewGroup
          heading='NTP servers'
          description={
            <LabelMapper
              id='ntp-server-review'
              ariaLabel='NTP servers'
              items={ntpServers}
            />
          }
        />
      )}
    </ReviewSection>
  );
};
