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
  Spinner,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { DeleteBlueprintModal } from './DeleteBlueprintModal';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isChecked = blueprint.id === selectedBlueprint;
  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteBlueprint, { isLoading }] = useDeleteBlueprintMutation();
  const handleDelete = async () => {
    setShowDeleteModal(false);
    await deleteBlueprint({ id: blueprint.id });
  };
  const onDeleteClose = () => {
    setShowDeleteModal(false);
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
          <DropdownItem onClick={() => setShowDeleteModal(true)}>
            Delete blueprint
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </>
  );

  return (
    <>
      <DeleteBlueprintModal
        onDelete={handleDelete}
        blueprintName={blueprint?.name}
        isOpen={showDeleteModal}
        onClose={onDeleteClose}
      />
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
          <CardTitle>
            {blueprint.name} {isLoading && <Spinner size="md" />}
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
