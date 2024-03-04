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
      <Card ouiaId={`blueprint-card-${blueprint.id}`} isCompact isClickable>
        <CardHeader
          data-testid={blueprint.id}
          selectableActions={{
            selectableActionId: blueprint.id,
            name: 'blueprints',
            onClickAction: () => dispatch(setBlueprintId(blueprint.id)),
          }}
        >
          <CardTitle>
            {isLoading && blueprint.id === selectedBlueprintId && (
              <Spinner size="md" />
            )}
            &nbsp;&nbsp;
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
