import React, { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectServices } from '@/store/slices';

import { sortOpenscapItems } from '../../helpers';
import { LabelMapper, ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

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

type ServicesProps = Hideable & {
  oscapServices?: OscapServices | undefined;
};

export const Services = ({
  shouldHide,
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

  if (shouldHide) {
    return null;
  }

  return (
    <>
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
        className='pf-v6-u-mb-md'
      />
    </>
  );
};
