import React, { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectKernel } from '@/store/slices';

import { sortOpenscapItems } from '../../helpers';
import { LabelMapper, ReviewGroup, ReviewSection } from '../../shared';
import { Hideable } from '../../types';

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
