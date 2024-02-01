import React from 'react';

import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Text,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeBlueprintDescription,
  changeBlueprintName,
  selectBlueprintDescription,
  selectBlueprintName,
} from '../../../../store/wizardSlice';
import { ValidatedTextInput } from '../../ValidatedTextInput';
import {
  isBlueprintDescriptionValid,
  isBlueprintNameValid,
} from '../../validators';

const DetailsStep = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector((state) => selectBlueprintName(state));
  const blueprintDescription = useAppSelector((state) =>
    selectBlueprintDescription(state)
  );
  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ) => {
    dispatch(changeBlueprintName(name));
  };

  const handleDescriptionChange = (
    _event: React.FormEvent<HTMLInputElement>,
    description: string
  ) => {
    dispatch(changeBlueprintDescription(description));
  };

  return (
    <Form>
      <Title headingLevel="h2">Details</Title>
      <Text>
        Optionally enter a name to identify your image later quickly. If you do
        not provide one, the UUID will be used as the name.
      </Text>
      <FormGroup isRequired label="Blueprint name" fieldId="blueprint-name">
        <ValidatedTextInput
          ariaLabel="blueprint name"
          dataTestId="blueprint"
          value={blueprintName}
          validator={isBlueprintNameValid}
          onChange={handleNameChange}
          helperText="Please enter a valid name"
          placeholder="Blueprint name"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>The name can be 1-100 characters</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup
        label="Blueprint description"
        fieldId="blueprint-description-name"
      >
        <ValidatedTextInput
          ariaLabel="blueprint description"
          dataTestId="blueprint description"
          value={blueprintDescription || ''}
          validator={isBlueprintDescriptionValid}
          onChange={handleDescriptionChange}
          helperText="Please enter a valid description"
          placeholder="Add description"
        />
      </FormGroup>
    </Form>
  );
};

export default DetailsStep;
