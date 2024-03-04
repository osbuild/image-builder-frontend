import React from 'react';

import { Button } from '@patternfly/react-core';

import { useComposeBlueprintMutation } from '../../store/imageBuilderApi';

interface BuildImagesButtonProps {
  selectedBlueprint?: string | undefined;
}

export const BuildImagesButton: React.FunctionComponent<
  BuildImagesButtonProps
> = ({ selectedBlueprint }: BuildImagesButtonProps) => {
  const [buildBlueprint, { isLoading: imageBuildLoading }] =
    useComposeBlueprintMutation();
  const onBuildHandler = async () => {
    selectedBlueprint && (await buildBlueprint({ id: selectedBlueprint }));
  };
  return (
    <Button
      ouiaId="build-images-button"
      onClick={onBuildHandler}
      isDisabled={!selectedBlueprint}
      isLoading={imageBuildLoading}
    >
      Build images
    </Button>
  );
};
