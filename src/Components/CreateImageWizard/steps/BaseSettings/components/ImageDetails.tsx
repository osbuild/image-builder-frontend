import React from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAuthor,
  changeBlueprintDescription,
  changeBlueprintName,
  selectAuthor,
  selectBlueprintDescription,
  selectBlueprintName,
  setIsCustomName,
} from '../../../../../store/wizardSlice';
import { useDetailsValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';

const ImageDetails = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const author = useAppSelector(selectAuthor);

  const stepValidation = useDetailsValidation();

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

  const handleAuthorChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    dispatch(changeAuthor(value));
  };

  return (
    <>
      <Title headingLevel='h2' size='lg'>
        Image details
      </Title>
      <FormGroup isRequired label='Blueprint name' fieldId='blueprint-name'>
        <ValidatedInputAndTextArea
          ariaLabel='blueprint name'
          dataTestId='blueprint'
          value={blueprintName}
          onChange={handleNameChange}
          placeholder='Add blueprint name'
          stepValidation={stepValidation}
          fieldName='name'
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
        label='Blueprint description'
        fieldId='blueprint-description-name'
      >
        <ValidatedInputAndTextArea
          ariaLabel='blueprint description'
          dataTestId='blueprint description'
          value={blueprintDescription}
          onChange={handleDescriptionChange}
          placeholder='Add description'
          stepValidation={stepValidation}
          fieldName='description'
        />
      </FormGroup>

      <FormGroup label='Author' fieldId='blueprint-author'>
        <ValidatedInputAndTextArea
          ariaLabel='author'
          dataTestId='blueprint-author'
          value={author}
          onChange={handleAuthorChange}
          placeholder='Add author'
          stepValidation={stepValidation}
          fieldName='author'
        />
      </FormGroup>
    </>
  );
};

export default ImageDetails;
