import React from 'react';

import { Button } from '@patternfly/react-core';

import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { openWizardModal } from '@/store/slices/wizardModal';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

export const EditBlueprintButton = () => {
  const dispatch = useAppDispatch();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);

  const handleEdit = () => {
    if (selectedBlueprintId) {
      dispatch(openWizardModal('edit'));
    }
  };

  return (
    <Button onClick={handleEdit} variant='secondary'>
      Edit blueprint
    </Button>
  );
};
