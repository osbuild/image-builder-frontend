import React from 'react';

import { Content, Form, FormGroup, Title } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeBlueprintDescription,
  changeBlueprintName,
  selectBlueprintDescription,
  selectBlueprintName,
  setIsCustomName,
} from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { useDetailsValidation } from '../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../ValidatedInput';

const DetailsStep = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

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
    <Wrapper>
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
        >
          Details
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Enter a name and description to identify your deployment-ready image.
        </Content>
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
    </Wrapper>
  );
};

export default DetailsStep;
