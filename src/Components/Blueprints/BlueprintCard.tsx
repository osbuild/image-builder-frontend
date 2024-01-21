import React, { useState } from 'react';

import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  DropdownItem,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { BlueprintItem } from '../../store/imageBuilderApi';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isChecked = blueprint.id === selectedBlueprint;
  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const onClickHandler = ({
    currentTarget: { id: blueprintID },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBlueprint(blueprintID);
  };

  const headerActions = (
    <>
      <Dropdown
        ouiaId={`blueprint-card-${blueprint.id}-dropdown`}
        onSelect={onSelect}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            isExpanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            variant="plain"
            aria-label="blueprint menu toggle"
          >
            <EllipsisVIcon aria-hidden="true" />
          </MenuToggle>
        )}
        isOpen={isOpen}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      >
        <DropdownList>
          <DropdownItem>Edit details</DropdownItem>
          <DropdownItem>Delete blueprint</DropdownItem>
        </DropdownList>
      </Dropdown>
    </>
  );

  return (
    <Card
      ouiaId={`blueprint-card-${blueprint.id}`}
      isCompact
      isClickable
      isSelectable
      isSelected={isChecked}
    >
      <CardHeader
        selectableActions={{
          selectableActionId: blueprint.id,
          name: blueprint.name,
          variant: 'single',
          isChecked: isChecked,
          onChange: onClickHandler,
        }}
        actions={{ actions: headerActions }}
      >
        <CardTitle>{blueprint.name}</CardTitle>
      </CardHeader>
      <CardBody>{blueprint.description}</CardBody>
      <CardFooter>
        Version <Badge isRead>{blueprint.version}</Badge>
      </CardFooter>
    </Card>
  );
};

export default BlueprintCard;
