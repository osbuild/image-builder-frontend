import React, { useState } from 'react';

import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addKernelArg,
  removeKernelArg,
  selectKernel,
} from '../../../../../store/wizardSlice';
import { isKernelArgumentValid } from '../../../validators';

const KernelArguments = () => {
  const dispatch = useAppDispatch();
  const kernelAppend = useAppSelector(selectKernel).append;

  const [inputValue, setInputValue] = useState('');
  const [errorText, setErrorText] = useState('');

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (
        isKernelArgumentValid(value) &&
        !kernelAppend.some((arg) => arg.name === value)
      ) {
        dispatch(addKernelArg({ name: value, isRequiredByOpenSCAP: false }));
        setInputValue('');
        setErrorText('');
      }

      if (kernelAppend.some((arg) => arg.name === value)) {
        setErrorText(`Kernel argument already exists.`);
      }

      if (!isKernelArgumentValid(value)) {
        setErrorText('Invalid format.');
      }
    }
  };

  const handleAddItem = (e: React.MouseEvent, value: string) => {
    dispatch(addKernelArg({ name: value, isRequiredByOpenSCAP: false }));
    setInputValue('');
  };
  return (
    <FormGroup isRequired={false} label="Append">
      <TextInputGroup>
        <TextInputGroupMain
          placeholder="Add kernel argument"
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
        />
        <TextInputGroupUtilities>
          <Button
            variant="plain"
            onClick={(e) => handleAddItem(e, inputValue)}
            isDisabled={!inputValue}
            aria-label="Add kernel argument"
          >
            <PlusCircleIcon className="pf-v5-u-primary-color-100" />
          </Button>
          <Button
            variant="plain"
            onClick={() => setInputValue('')}
            isDisabled={!inputValue}
            aria-label="Clear input"
          >
            <TimesIcon />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
        </HelperText>
      )}
      {kernelAppend.some((arg) => arg.isRequiredByOpenSCAP) && (
        <ChipGroup
          categoryName="Required by OpenSCAP"
          numChips={20}
          className="pf-v5-u-mt-sm pf-v5-u-w-100"
        >
          {kernelAppend
            .filter((arg) => arg.isRequiredByOpenSCAP)
            .map((arg) => (
              <Chip
                key={arg.name}
                onClick={() => dispatch(removeKernelArg(arg.name))}
                isReadOnly
              >
                {arg.name}
              </Chip>
            ))}
        </ChipGroup>
      )}
      <ChipGroup numChips={20} className="pf-v5-u-mt-sm pf-v5-u-w-100">
        {kernelAppend
          .filter((arg) => !arg.isRequiredByOpenSCAP)
          .map((arg) => (
            <Chip
              key={arg.name}
              onClick={() => dispatch(removeKernelArg(arg.name))}
            >
              {arg.name}
            </Chip>
          ))}
      </ChipGroup>
    </FormGroup>
  );
};

export default KernelArguments;
