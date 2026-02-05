import React from 'react';

import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Spinner,
} from '@patternfly/react-core';

import { useDeleteBPWithNotification as useDeleteBlueprintMutation } from '../../Hooks';
import {
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { selectIsOnPremise } from '../../store/envSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { BlueprintItem } from '../../store/imageBuilderApi';

type blueprintProps = {
  blueprint: BlueprintItem;
};

const BlueprintCard = ({ blueprint }: blueprintProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);

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
          <CardTitle aria-label={blueprint.name}>
            {isLoading && blueprint.id === selectedBlueprintId && (
              <Spinner size='md' />
            )}
            {
              // NOTE: This might be an issue with the pf6 truncate component.
              // Since we're not really using the popover, we can just
              // use vanilla js to truncate the string rather than use the
              // Truncate component. We can match the behaviour of the component
              // by also splitting on 24 characters.
              // https://github.com/patternfly/patternfly-react/issues/11964
              blueprint.name && blueprint.name.length > 24
                ? blueprint.name.slice(0, 24) + '...'
                : blueprint.name
            }
          </CardTitle>
        </CardHeader>
        <CardBody>{blueprint.description}</CardBody>
        {!isOnPremise && (
          <CardFooter>
            Version <Badge isRead>{blueprint.version}</Badge>
          </CardFooter>
        )}
      </Card>
    </>
  );
};

export default BlueprintCard;
