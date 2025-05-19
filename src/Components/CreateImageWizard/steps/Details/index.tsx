import React from 'react';

import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Content,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeBlueprintDescription,
  changeBlueprintName,
  selectBlueprintDescription,
  selectBlueprintName,
  setIsCustomName,
} from '../../../../store/wizardSlice';
import { useDetailsValidation } from '../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../ValidatedInput';

const DetailsStep = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    dispatch(changeBlueprintName(name));
    dispatch(setIsCustomName());
  };

  const handleDescriptionChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    description: string
  ) => {
    dispatch(changeBlueprintDescription(description));
  };

  const stepValidation = useDetailsValidation();

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Details
      </Title>
      <Content>
        Enter a name to identify your blueprint. If no name is entered, the
        images created from this blueprint will use the name of the parent
        blueprint.
      </Content>
      <FormGroup isRequired label="Blueprint name" fieldId="blueprint-name">
        <ValidatedInputAndTextArea
          ariaLabel="blueprint name"
          dataTestId="blueprint"
          value={blueprintName}
          onChange={handleNameChange}
          placeholder="Add blueprint name"
          stepValidation={stepValidation}
          fieldName="name"
          isRequired={true}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The name can be 2-100 characters with at least two letters or
              numbers
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup
        label="Blueprint description"
        fieldId="blueprint-description-name"
      >
        <ValidatedInputAndTextArea
          ariaLabel="blueprint description"
          dataTestId="blueprint description"
          value={blueprintDescription}
          onChange={handleDescriptionChange}
          placeholder="Add description"
          stepValidation={stepValidation}
          fieldName="description"
        />
      </FormGroup>
    </Form>
  );
};

export default DetailsStep;
