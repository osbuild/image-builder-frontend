import React from 'react';

import { Button, ButtonProps } from '@patternfly/react-core';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import { useComposeBlueprintMutation } from '../../store/imageBuilderApi';

type BuildImagesButtonPropTypes = {
  variant?: ButtonProps['variant'];
  children?: React.ReactNode;
};

export const BuildImagesButton = ({
  variant,
  children,
}: BuildImagesButtonPropTypes) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const [buildBlueprint, { isLoading: imageBuildLoading }] =
    useComposeBlueprintMutation();
  const onBuildHandler = async () => {
    selectedBlueprintId &&
      (await buildBlueprint({ id: selectedBlueprintId, body: {} }));
  };
  return (
    <Button
      ouiaId="build-images-button"
      onClick={onBuildHandler}
      isDisabled={!selectedBlueprintId}
      isLoading={imageBuildLoading}
      variant={variant}
    >
      {children ? children : 'Build images'}
    </Button>
  );
};
