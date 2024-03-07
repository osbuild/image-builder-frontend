import React from 'react';

import { Button } from '@patternfly/react-core';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import { useComposeBlueprintMutation } from '../../store/imageBuilderApi';

export const BuildImagesButton = () => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const [buildBlueprint, { isLoading: imageBuildLoading }] =
    useComposeBlueprintMutation();
  const onBuildHandler = async () => {
    selectedBlueprintId && (await buildBlueprint({ id: selectedBlueprintId }));
  };
  return (
    <Button
      ouiaId="build-images-button"
      onClick={onBuildHandler}
      isDisabled={!selectedBlueprintId}
      isLoading={imageBuildLoading}
    >
      Build images
    </Button>
  );
};
