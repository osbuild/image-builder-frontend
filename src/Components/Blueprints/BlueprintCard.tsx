import React from 'react';

import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Spinner,
} from '@patternfly/react-core';

import {
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  useDeleteBlueprintMutation,
} from '../../store/imageBuilderApi';

type blueprintProps = {
  blueprint: BlueprintItem;
};

const BlueprintCard = ({ blueprint }: blueprintProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const dispatch = useAppDispatch();

  const [, { isLoading }] = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });

  return (
    <>
      <Card
        isSelected={blueprint.id === selectedBlueprintId}
        ouiaId={`blueprint-card-${blueprint.id}`}
        data-testid={`blueprint-card`}
        isCompact
        isClickable
        onClick={() => dispatch(setBlueprintId(blueprint.id))}
        isSelectableRaised
        hasSelectableInput
        selectableInputAriaLabel={`Select blueprint ${blueprint.name}`}
      >
        <CardHeader data-testid={blueprint.id}>
          <CardTitle>
            {isLoading && blueprint.id === selectedBlueprintId && (
              <Spinner size="md" />
            )}
            {blueprint.name}
          </CardTitle>
        </CardHeader>
        <CardBody>{blueprint.description}</CardBody>
        <CardFooter>
          Version <Badge isRead>{blueprint.version}</Badge>
        </CardFooter>
      </Card>
    </>
  );
};

export default BlueprintCard;
