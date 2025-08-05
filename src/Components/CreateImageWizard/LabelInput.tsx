import React, { useState } from 'react';

import {
  Button,
  HelperText,
  HelperTextItem,
  Icon,
  Label,
  LabelGroup,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core/dist/esm';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { UnknownAction } from 'redux';

import { StepValidation } from './utilities/useValidation';

import { useAppDispatch } from '../../store/hooks';

type LabelInputProps = {
  ariaLabel: string;
  placeholder: string;
  validator: (value: string) => boolean;
  requiredList?: string[] | undefined;
  requiredCategoryName?: string;
  list: string[] | undefined;
  item: string;
  addAction: (value: string) => UnknownAction;
  removeAction: (value: string) => UnknownAction;
  stepValidation: StepValidation;
  fieldName: string;
};

const LabelInput = ({
  ariaLabel,
  placeholder,
  validator,
  list,
  requiredList,
  requiredCategoryName,
  item,
  addAction,
  removeAction,
  stepValidation,
  fieldName,
}: LabelInputProps) => {
  const dispatch = useAppDispatch();

  const [inputValue, setInputValue] = useState('');
  const [onStepInputErrorText, setOnStepInputErrorText] = useState('');
  let [invalidImports, duplicateImports] = ['', ''];

  if (stepValidation.errors[fieldName]) {
    [invalidImports, duplicateImports] =
      stepValidation.errors[fieldName].split('|');
  }

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
    setOnStepInputErrorText('');
  };

  const addItem = (value: string) => {
    if (list?.includes(value) || requiredList?.includes(value)) {
      setOnStepInputErrorText(`${item} already exists.`);
      return;
    }

    if (!validator(value)) {
      switch (fieldName) {
        case 'ports':
          setOnStepInputErrorText(
            'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp',
          );
          break;
        case 'kernelAppend':
          setOnStepInputErrorText(
            'Expected format: <kernel-argument>. Example: console=tty0',
          );
          break;
        case 'kernelName':
          setOnStepInputErrorText(
            'Expected format: <kernel-name>. Example: kernel-5.14.0-284.11.1.el9_2.x86_64',
          );
          break;
        case 'groups':
          setOnStepInputErrorText(
            'Expected format: <group-name>. Example: admin',
          );
          break;
        case 'ntpServers':
          setOnStepInputErrorText(
            'Expected format: <ntp-server>. Example: time.redhat.com',
          );
          break;
        case 'enabledSystemdServices':
        case 'disabledSystemdServices':
        case 'maskedSystemdServices':
        case 'disabledServices':
        case 'enabledServices':
          setOnStepInputErrorText(
            'Expected format: <service-name>. Example: sshd',
          );
          break;
        default:
          setOnStepInputErrorText('Invalid format.');
      }
      return;
    }

    dispatch(addAction(value));
    setInputValue('');
    setOnStepInputErrorText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  const handleAddItem = (e: React.MouseEvent, value: string) => {
    addItem(value);
  };

  const handleRemoveItem = (e: React.MouseEvent, value: string) => {
    dispatch(removeAction(value));
  };

  const handleClear = () => {
    setInputValue('');
    setOnStepInputErrorText('');
  };

  const errors = [];
  if (onStepInputErrorText) errors.push(onStepInputErrorText);
  if (invalidImports) errors.push(invalidImports);
  if (duplicateImports) errors.push(duplicateImports);

  return (
    <>
      <TextInputGroup>
        <TextInputGroupMain
          placeholder={placeholder}
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
        />
        <TextInputGroupUtilities>
          <Button
            icon={
              <Icon status="info">
                <PlusCircleIcon />
              </Icon>
            }
            variant="plain"
            onClick={(e) => handleAddItem(e, inputValue)}
            isDisabled={!inputValue}
            aria-label={ariaLabel}
          />
          <Button
            icon={<TimesIcon />}
            variant="plain"
            onClick={handleClear}
            isDisabled={!inputValue}
            aria-label="Clear input"
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
      {errors.length > 0 && (
        <HelperText>
          {errors.map((error, index) => (
            <HelperTextItem key={index} variant={'error'}>
              {error}
            </HelperTextItem>
          ))}
        </HelperText>
      )}
      {requiredList && requiredList.length > 0 && (
        <LabelGroup
          categoryName={requiredCategoryName}
          numLabels={20}
          className="pf-v6-u-mt-sm pf-v6-u-w-100"
        >
          {requiredList.map((item) => (
            <Label key={item} isCompact>
              {item}
            </Label>
          ))}
        </LabelGroup>
      )}
      <LabelGroup numLabels={20} className="pf-v6-u-mt-sm pf-v6-u-w-100">
        {list?.map((item) => (
          <Label
            key={item}
            isCompact
            onClose={(e) => handleRemoveItem(e, item)}
          >
            {item}
          </Label>
        ))}
      </LabelGroup>
    </>
  );
};

export default LabelInput;
