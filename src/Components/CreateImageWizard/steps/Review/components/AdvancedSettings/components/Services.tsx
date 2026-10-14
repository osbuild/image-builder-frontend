import React, { useMemo } from 'react';

import { sortOpenscapItems } from '@/Components/CreateImageWizard/steps/Review/components/helpers';
import {
  LabelMapper,
  ReviewGroup,
  ReviewSection,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { useAppSelector } from '@/store/hooks';
import { selectServices } from '@/store/slices';

type OscapServices = {
  enabled: string[];
  disabled: string[];
  masked: string[];
};

const emptyOscapServices: OscapServices = {
  enabled: [],
  disabled: [],
  masked: [],
};

type ServicesProps = {
  oscapServices?: OscapServices | undefined;
};

export const Services = ({
  oscapServices = emptyOscapServices,
}: ServicesProps) => {
  const services = useAppSelector(selectServices);

  const { enabled, disabled, masked } = useMemo(
    () => ({
      enabled: sortOpenscapItems(oscapServices.enabled, services.enabled),
      disabled: sortOpenscapItems(oscapServices.disabled, services.disabled),
      masked: sortOpenscapItems(oscapServices.masked, services.masked),
    }),
    [services, oscapServices],
  );

  return (
    <ReviewSection title='Systemd services'>
      <ReviewGroup
        heading='Enabled systemd services'
        description={
          <LabelMapper
            id='enabled-service-review'
            ariaLabel='Enabled services'
            emptyMessage='No services selected'
            items={enabled}
            oscapItems={oscapServices.enabled}
          />
        }
      />
      <ReviewGroup
        heading='Disabled systemd services'
        description={
          <LabelMapper
            id='disabled-service-review'
            ariaLabel='Disabled services'
            emptyMessage='No services selected'
            items={disabled}
            oscapItems={oscapServices.disabled}
          />
        }
      />
      <ReviewGroup
        heading='Masked systemd services'
        description={
          <LabelMapper
            id='masked-service-review'
            ariaLabel='Masked services'
            emptyMessage='No services selected'
            items={masked}
            oscapItems={oscapServices.masked}
          />
        }
      />
    </ReviewSection>
  );
};
