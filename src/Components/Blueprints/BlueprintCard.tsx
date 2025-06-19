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

import { useDeleteBPWithNotification as useDeleteBlueprintMutation } from '../../Hooks';
import {
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { BlueprintItem } from '../../store/imageBuilderApi';

type blueprintProps = {
  blueprint: BlueprintItem;
};

const BlueprintCard = ({ blueprint }: blueprintProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const dispatch = useAppDispatch();

  const { isLoading } = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });

  return (
    <>
      <Card
        isClicked={blueprint.id === selectedBlueprintId}
        data-testid={`blueprint-card`}
        isCompact
        isClickable
        onClick={() => dispatch(setBlueprintId(blueprint.id))}
      >
        <CardHeader
          data-testid={blueprint.id}
          selectableActions={{
            name: blueprint.name,
            // use the name rather than the id. This helps us
            // chose the correct item in the playwright tests
            selectableActionId: blueprint.name,
            selectableActionAriaLabel: blueprint.name,
            onChange: () => dispatch(setBlueprintId(blueprint.id)),
          }}
        >
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
