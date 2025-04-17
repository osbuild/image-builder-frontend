import React from 'react';

import { Alert } from '@patternfly/react-core';

import OscapProfileInformation from './components/OscapProfileInformation';
import PolicySelector from './components/PolicySelector';
import ProfileSelector from './components/ProfileSelector';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectComplianceProfileID,
  selectComplianceType,
  selectImageTypes,
} from '../../../../store/wizardSlice';

const Oscap = () => {
  const oscapProfile = useAppSelector(selectComplianceProfileID);
  const environments = useAppSelector(selectImageTypes);
  const complianceType = useAppSelector(selectComplianceType);

  return (
    <>
      {environments.includes('wsl') && (
        <Alert
          variant="warning"
          isInline
          title="OpenSCAP profiles are not compatible with WSL images."
        />
      )}
      {complianceType === 'openscap' ? <ProfileSelector /> : <PolicySelector />}
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

export default Oscap;
