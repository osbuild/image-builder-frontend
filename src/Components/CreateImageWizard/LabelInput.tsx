import React, { useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core/dist/esm';
import { UnknownAction } from 'redux';

import { StepValidation } from './utilities/useValidation';

import { UNDEFINED_GROUPS_WARNING_KEY } from '../../constants';
import { useAppDispatch } from '../../store/hooks';

const FIREWALL_LABEL_TRUNCATE_DEFAULT = 20;

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
  truncateLength?: number;
  inlineChips?: boolean;
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
  truncateLength = FIREWALL_LABEL_TRUNCATE_DEFAULT,
  inlineChips = false,
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
          setOnStepInputErrorText(
            'Expected format: <service-name>. Example: sshd',
          );
          break;
        case 'disabledServices':
        case 'enabledServices':
          setOnStepInputErrorText(
            'Expected format: <firewalld-service-name>. Example: ssh.',
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
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, value: string) => {
    dispatch(removeAction(value));
  };

  const errors = [];
  if (onStepInputErrorText) errors.push(onStepInputErrorText);
  if (invalidImports) errors.push(invalidImports);
  if (duplicateImports) errors.push(duplicateImports);

  const chipsInInput = inlineChips && list && list.length > 0 && (
    <LabelGroup
      isCompact
      numLabels={4}
      expandedText='Show less'
      collapsedText={`${list.length - 4} more`}
    >
      {list.map((group) => (
        <Label
          key={group}
          color='blue'
          isCompact
          onClose={(e) => handleRemoveItem(e, group)}
        >
          {group.length > truncateLength
            ? `${group.slice(0, truncateLength)}...`
            : group}
        </Label>
      ))}
    </LabelGroup>
  );

  const inputWithInlineChips = inlineChips && (
    <TextInputGroup>
      <TextInputGroupMain
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={onTextInputChange}
        value={inputValue}
        onKeyDown={(e) => handleKeyDown(e, inputValue)}
      >
        {chipsInInput}
      </TextInputGroupMain>
    </TextInputGroup>
  );

  const warning = stepValidation.errors[UNDEFINED_GROUPS_WARNING_KEY];

  return (
    <>
      {inlineChips ? (
        inputWithInlineChips
      ) : (
        <TextInputGroup>
          <TextInputGroupMain
            aria-label={ariaLabel}
            placeholder={placeholder}
            onChange={onTextInputChange}
            value={inputValue}
            onKeyDown={(e) => handleKeyDown(e, inputValue)}
          >
            {list && list.length > 0 && (
              <LabelGroup numLabels={20} className='pf-v6-u-mr-sm'>
                {list.map((item) => (
                  <Label
                    key={item}
                    color='blue'
                    onClose={(e) => handleRemoveItem(e, item)}
                  >
                    {item.length > FIREWALL_LABEL_TRUNCATE_DEFAULT
                      ? `${item.slice(0, FIREWALL_LABEL_TRUNCATE_DEFAULT)}...`
                      : item}
                  </Label>
                ))}
              </LabelGroup>
            )}
          </TextInputGroupMain>
        </TextInputGroup>
      )}

      {errors.length > 0 && (
        <HelperText>
          {errors.map((error, index) => (
            <HelperTextItem key={index} variant={'error'}>
              {error}
            </HelperTextItem>
          ))}
        </HelperText>
      )}
      {warning && (
        <HelperText>
          <HelperTextItem variant={'warning'}>{warning}</HelperTextItem>
        </HelperText>
      )}
      {requiredList && requiredList.length > 0 && (
        <LabelGroup
          categoryName={requiredCategoryName}
          numLabels={20}
          className='pf-v6-u-mt-sm pf-v6-u-w-100'
        >
          {requiredList.map((item) => (
            <Label key={item} isCompact>
              {item}
            </Label>
          ))}
        </LabelGroup>
      )}
    </>
  );
};

export default LabelInput;
