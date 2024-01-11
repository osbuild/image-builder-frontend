import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Radio,
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  DropdownItem,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { Blueprint } from '../../store/imageBuilderApiExperimental';

const BlueprintCard = (props: {
  blueprint: Blueprint;
  setSelectedBlueprint: React.Dispatch<React.SetStateAction<string>>;
  selectedBlueprint: string;
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const isChecked = props.blueprint.id === props.selectedBlueprint;
  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = () => {
    props.setSelectedBlueprint(props.blueprint.id);
  };

  const headerActions = (
    <>
      <Dropdown
        onSelect={onSelect}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            isExpanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            variant="plain"
            aria-label="Card expandable toggle"
          >
            <EllipsisVIcon aria-hidden="true" />
          </MenuToggle>
        )}
        isOpen={isOpen}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      >
        <DropdownList>
          <DropdownItem key="disabled action" isDisabled>
            Delete
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <Radio
        isChecked={isChecked}
        onChange={handleChange}
        aria-label="blueprint checkbox"
        id={props.blueprint.id}
        name={props.blueprint.id}
      />
    </>
  );

  return (
    <Card className="pf-v5-u-mb-md">
      <CardHeader actions={{ actions: headerActions }}>
        <CardTitle>{props.blueprint.name}</CardTitle>
      </CardHeader>
      <CardBody>{props.blueprint.description}</CardBody>
    </Card>
  );
};

export default BlueprintCard;
