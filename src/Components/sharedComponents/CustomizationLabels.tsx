import React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';
import { CheckIcon, MinusIcon } from '@patternfly/react-icons';

import { CustomizationType } from '../../store/distributions';
import { useImageTypeCustomizationSupport } from '../../store/distributions/hooks';

export const CustomizationLabels = ({
  customization,
}: {
  customization: CustomizationType;
}) => {
  const supportLabels = useImageTypeCustomizationSupport(customization);

  if (supportLabels.length === 0) {
    return <></>;
  }

  return (
    <LabelGroup
      // the mocks didn't show an overflow, but
      // maybe we could set a sane default here
      numLabels={5}
    >
      {supportLabels.map(({ name, supported }) => {
        if (!supported) {
          return (
            <Label key={name} className='pf-v6-u-mr-sm' icon={<MinusIcon />}>
              {name}: customization is not supported
            </Label>
          );
        }

        return (
          <Label
            key={name}
            className='pf-v6-u-mr-sm'
            variant='outline'
            color='blue'
            icon={
              <CheckIcon
                style={{
                  color: 'var(--pf-t--global--color--brand--default)',
                }}
              />
            }
          >
            {name}: customization is supported
          </Label>
        );
      })}
    </LabelGroup>
  );
};
