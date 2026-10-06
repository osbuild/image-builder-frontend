import React from 'react';

import {
  LabelMapper,
  ReviewGroup,
  ReviewSection,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import { selectNtpServers, selectTimezone } from '@/store/slices';

export const Timezone = ({ shouldHide }: Hideable) => {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);

  return (
    <ReviewSection title='Timezone' shouldHide={shouldHide}>
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
