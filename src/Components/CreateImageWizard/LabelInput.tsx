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
  const [errorText, setErrorText] = useState(stepValidation.errors[fieldName]);

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
    setErrorText('');
  };

  const addItem = (value: string) => {
    if (list?.includes(value) || requiredList?.includes(value)) {
      setErrorText(`${item} already exists.`);
      return;
    }

    if (!validator(value)) {
      switch (fieldName) {
        case 'ports':
          setErrorText(
            'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp'
          );
          break;
        case 'kernelAppend':
          setErrorText(
            'Expected format: <kernel-argument>. Example: console=tty0'
          );
          break;
        case 'kernelName':
          setErrorText(
            'Expected format: <kernel-name>. Example: kernel-5.14.0-284.11.1.el9_2.x86_64'
          );
          break;
        case 'groups':
          setErrorText('Expected format: <group-name>. Example: admin');
          break;
        case 'ntpServers':
          setErrorText(
            'Expected format: <ntp-server>. Example: time.redhat.com'
          );
          break;
        case 'enabledSystemdServices':
        case 'disabledSystemdServices':
        case 'maskedSystemdServices':
        case 'disabledServices':
        case 'enabledServices':
          setErrorText('Expected format: <service-name>. Example: sshd');
          break;
        default:
          setErrorText('Invalid format.');
      }
      return;
    }

    dispatch(addAction(value));
    setInputValue('');
    setErrorText('');
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
    setErrorText('');
  };

  const handleClear = () => {
    setInputValue('');
    setErrorText('');
  };

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
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
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
