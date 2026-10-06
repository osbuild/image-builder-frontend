import React from 'react';

import { Content } from '@patternfly/react-core';

import { ReviewGroup } from '@/Components/CreateImageWizard/steps/Review/components/shared';
import type { MiscFormatType } from '@/store/slices/wizard';

const MISC_FORMATS: Record<MiscFormatType, string> = {
  'bootable-container-iso': 'Container installer (.iso)',
  'guest-image': 'Virtualization (.qcow2)',
  'image-installer': 'Baremetal (.iso)',
  'pxe-tar-xz': 'Network - PXE Boot',
  'network-installer': 'Network - Installer',
  wsl: 'Windows Subsystem for Linux (.tar.gz)',
};

export const MiscFormats = ({
  environments,
}: {
  environments: MiscFormatType[];
}) => {
  if (environments.length === 0) {
    return null;
  }

  return (
    <ReviewGroup
      className='pf-v6-u-mb-md'
      heading='Miscellaneous formats'
      description={
        <>
          {environments.map((cloud) => (
            <Content component='p' key={cloud}>
              {MISC_FORMATS[cloud]}
            </Content>
          ))}
        </>
      }
    />
  );
};
