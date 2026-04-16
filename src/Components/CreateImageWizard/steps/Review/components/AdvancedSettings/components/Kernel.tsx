import React, { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectKernel } from '@/store/slices';

import { sortOpenscapItems } from '../../helpers';
import { LabelMapper, ReviewGroup } from '../../shared';
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

  if (shouldHide || !(name || args.length > 0)) {
    return null;
  }

  return (
    <>
      {name !== '' && (
        <ReviewGroup
          heading='Kernel package'
          description={name}
          className={append.length > 0 ? '' : 'pf-v6-u-mb-md'}
        />
      )}
      {args.length > 0 && (
        <ReviewGroup
          heading='Args'
          description={
            <LabelMapper
              id='kernel-append-review'
              ariaLabel='Kernel arguments'
              emptyMessage='No kernel args selected'
              items={args}
              oscapItems={oscapKernelArgs}
            />
          }
          className='pf-v6-u-mb-md'
        />
      )}
    </>
  );
};
