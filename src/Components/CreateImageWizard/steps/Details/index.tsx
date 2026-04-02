import React from 'react';

import { Content, Form, FormGroup, Title } from '@patternfly/react-core';

import {
  changeBlueprintDescription,
  changeBlueprintName,
  selectBlueprintDescription,
  selectBlueprintName,
  setIsCustomName,
} from '@/store/slices/wizard';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { useDetailsValidation } from '../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../ValidatedInput';

const DetailsStep = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string,
  ) => {
    dispatch(changeBlueprintName(name));
    dispatch(setIsCustomName());
  };

  const handleDescriptionChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    description: string,
  ) => {
    dispatch(changeBlueprintDescription(description));
  };

  const stepValidation = useDetailsValidation();

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Image details
      </Title>
      <Content>
        Enter a name and description to identify your deployment-ready image.
      </Content>
      <FormGroup isRequired label='Name' fieldId='blueprint-name'>
        <ValidatedInputAndTextArea
          ariaLabel='blueprint name'
          dataTestId='blueprint'
          value={blueprintName}
          onChange={handleNameChange}
          placeholder='Add blueprint name'
          stepValidation={stepValidation}
          fieldName='name'
          isRequired={true}
          handleClear={() => dispatch(changeBlueprintName(''))}
        />
      </FormGroup>

      <FormGroup label='Description' fieldId='blueprint-description-name'>
        <ValidatedInputAndTextArea
          ariaLabel='blueprint description'
          dataTestId='blueprint description'
          value={blueprintDescription}
          onChange={handleDescriptionChange}
          placeholder='Add description'
          stepValidation={stepValidation}
          fieldName='description'
          handleClear={() => dispatch(changeBlueprintDescription(''))}
        />
      </FormGroup>
    </Form>
  );
};

export default DetailsStep;
