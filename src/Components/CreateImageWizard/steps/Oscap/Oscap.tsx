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
          variant='warning'
          isInline
          title='OpenSCAP profiles are not compatible with WSL images.'
        />
      )}
      {complianceType === 'openscap' ? <ProfileSelector /> : <PolicySelector />}
      {oscapProfile && <OscapProfileInformation />}
    </>
  );
};

export default Oscap;
