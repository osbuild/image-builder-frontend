import React, { useEffect } from 'react';

import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useLocation, useNavigate } from 'react-router-dom';

import CreateImageWizard from './CreateImageWizard';

import { useAppDispatch } from '../../store/hooks';
import { loadWizardState, wizardState } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';

const ImportImageWizard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const addNotification = useAddNotification();
  const locationState = location.state as { blueprint?: wizardState };
  const blueprint = locationState.blueprint;
  useEffect(() => {
    if (blueprint) {
      dispatch(loadWizardState(blueprint));
    } else {
      navigate(resolveRelPath(''));
      addNotification({
        variant: 'warning',
        title: 'No blueprint was imported',
      });
    }
  }, [blueprint, dispatch]);
  return <CreateImageWizard />;
};

export default ImportImageWizard;
