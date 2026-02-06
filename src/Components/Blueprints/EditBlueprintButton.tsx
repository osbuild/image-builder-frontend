import React from 'react';

import { Button } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { selectPathResolver } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';

export const EditBlueprintButton = () => {
  const navigate = useNavigate();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const resolvePath = useAppSelector(selectPathResolver);

  return (
    <Button
      onClick={() =>
        navigate(resolvePath(`imagewizard/${selectedBlueprintId}`))
      }
      variant='secondary'
    >
      Edit blueprint
    </Button>
  );
};
