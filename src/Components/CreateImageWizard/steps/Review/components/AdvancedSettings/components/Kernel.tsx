import React, { useMemo } from 'react';

import { sortOpenscapItems } from '@/Components/CreateImageWizard/steps/Review/components/helpers';
import {
  LabelMapper,
  ReviewGroup,
  ReviewSection,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import { selectKernel } from '@/store/slices';

type KernelProps = Hideable & {
  oscapKernelArgs?: string[];
};

export const Kernel = ({ shouldHide, oscapKernelArgs = [] }: KernelProps) => {
  const { name, append } = useAppSelector(selectKernel);

  const args = useMemo(
    () => sortOpenscapItems(oscapKernelArgs, append),
    [append, oscapKernelArgs],
  );

  return (
    <ReviewSection
      title='Kernel'
      shouldHide={shouldHide || !(name || args.length > 0)}
    >
      {name !== '' && (
        <ReviewGroup heading='Kernel package' description={name} />
      )}
      {args.length > 0 && (
        <ReviewGroup
          heading='Arguments'
          description={
            <LabelMapper
              id='kernel-append-review'
              ariaLabel='Kernel arguments'
              emptyMessage='No kernel args selected'
              items={args}
              oscapItems={oscapKernelArgs}
            />
          }
        />
      )}
    </ReviewSection>
  );
};
