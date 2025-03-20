import React from 'react';

import { Alert } from '@patternfly/react-core';

import ProfileSelector from './components/ProfileSelector';
import OscapProfileInformation from './OscapProfileInformation';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectComplianceProfileID,
  selectImageTypes,
} from '../../../../store/wizardSlice';

export const Oscap = () => {
  const oscapProfile = useAppSelector(selectComplianceProfileID);
  const environments = useAppSelector(selectImageTypes);

  return (
    <>
      {environments.includes('wsl') && (
        <Alert
          variant="warning"
          isInline
          title="OpenSCAP profiles are not compatible with WSL images."
        />
      )}
      <ProfileSelector />
      {oscapProfile && <OscapProfileInformation />}
      {oscapProfile && (
        <Alert
          variant="info"
          isInline
          isPlain
          title="Additional customizations"
        >
          Selecting an OpenSCAP profile will cause the appropriate packages,
          file system configuration, kernel arguments, and services to be added
          to your image.
        </Alert>
      )}
    </>
  );
};
