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
  BlueprintItem,
  useDeleteBlueprintMutation,
} from '../../store/imageBuilderApi';

type blueprintProps = {
  blueprint: BlueprintItem;
  selectedBlueprint: string | undefined;
  setSelectedBlueprint: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

const BlueprintCard = ({
  blueprint,
  selectedBlueprint,
  setSelectedBlueprint,
}: blueprintProps) => {
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
            onClickAction: () => setSelectedBlueprint(blueprint.id),
          }}
        >
          <CardTitle>
            {isLoading && blueprint.id === selectedBlueprint && (
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
