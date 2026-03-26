import React from 'react';

import { Button } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { selectPathResolver } from '@/store/slices/env';
import { openWizardModal } from '@/store/slices/wizardModal';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useFlag } from '../../Utilities/useGetEnvironment';

export const EditBlueprintButton = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const resolvePath = useAppSelector(selectPathResolver);
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const handleEdit = () => {
    if (isWizardRevampEnabled && selectedBlueprintId) {
      dispatch(openWizardModal('edit'));
    } else {
      navigate(resolvePath(`imagewizard/${selectedBlueprintId}`));
    }
  };

  return (
    <Button onClick={handleEdit} variant='secondary'>
      Edit blueprint
    </Button>
  );
};
