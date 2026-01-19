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

type ControlledProps = {
  currentInputValue: string;
  onInputValueChange: (value: string) => UnknownAction;
};

type UncontrolledProps = {
  currentInputValue?: never;
  onInputValueChange?: never;
};

type LabelInputProps = (ControlledProps | UncontrolledProps) & {
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
  addOnBlur?: boolean;
};

const getErrorMessage = (fieldName: string): string => {
  switch (fieldName) {
    case 'ports':
      return 'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp';
    case 'kernelAppend':
      return 'Expected format: <kernel-argument>. Example: console=tty0';
    case 'kernelName':
      return 'Expected format: <kernel-name>. Example: kernel-5.14.0-284.11.1.el9_2.x86_64';
    case 'groups':
      return 'Expected format: <group-name>. Example: admin';
    case 'ntpServers':
      return 'Expected format: <ntp-server>. Example: time.redhat.com';
    case 'enabledSystemdServices':
    case 'disabledSystemdServices':
    case 'maskedSystemdServices':
      return 'Expected format: <service-name>. Example: sshd';
    case 'disabledServices':
    case 'enabledServices':
      return 'Expected format: <firewalld-service-name>. Example: ssh.';
    default:
      return 'Invalid format.';
  }
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
  currentInputValue,
  onInputValueChange,
  addOnBlur = false,
}: LabelInputProps) => {
  const dispatch = useAppDispatch();

  const isReduxControlled = currentInputValue !== undefined;
  const [localInputValue, setLocalInputValue] = useState('');
  const inputValue = isReduxControlled ? currentInputValue : localInputValue;

  const [onStepInputErrorText, setOnStepInputErrorText] = useState('');

  const validationErrorText = stepValidation.errors[fieldName] ?? '';
  const validationErrors = validationErrorText
    ? validationErrorText.split(/\s*\|\s*/).filter((e) => e.trim())
    : [];

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    if (isReduxControlled) {
      dispatch(onInputValueChange(value));
    } else {
      setLocalInputValue(value);
    }
    setOnStepInputErrorText('');
  };

  const addItem = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    if (list?.includes(trimmedValue) || requiredList?.includes(trimmedValue)) {
      setOnStepInputErrorText(`${item} already exists.`);
      return;
    }

    if (!validator(trimmedValue)) {
      setOnStepInputErrorText(getErrorMessage(fieldName));
      return;
    }

    dispatch(addAction(trimmedValue));
    if (isReduxControlled) {
      dispatch(onInputValueChange(''));
    } else {
      setLocalInputValue('');
    }
    setOnStepInputErrorText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!addOnBlur) return;
    // For controlled inputs, if focus is moving to a button (e.g. "Add user",
    // "Next"), skip adding here. The button's click handler will commit
    // the pending value via commitAllPendingGroupInputs instead. Adding here
    // would insert a warning that shifts the DOM before the click fires.
    if (isReduxControlled) {
      const target = e.relatedTarget as HTMLElement | null;
      if (target?.closest('button, a, [role="button"]')) return;
    }
    if (inputValue.trim()) {
      addItem(inputValue);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, value: string) => {
    dispatch(removeAction(value));
  };

  const errors = [];
  if (onStepInputErrorText) errors.push(onStepInputErrorText);
  errors.push(...validationErrors);

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
        onBlur={handleBlur}
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
            onBlur={handleBlur}
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
