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

const DEFAULT_TRUNCATE_LENGTH = 20;
const CHIP_COLLAPSE_THRESHOLD = 4;

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
  isCompact?: boolean;
  inlineChips?: boolean;
  addOnBlur?: boolean;
  skipBlurForButtons?: boolean;
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
  truncateLength = DEFAULT_TRUNCATE_LENGTH,
  isCompact = false,
  inlineChips = false,
  currentInputValue,
  onInputValueChange,
  addOnBlur = false,
  skipBlurForButtons = false,
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
    const target = e.relatedTarget as HTMLElement | null;
    if (skipBlurForButtons) {
      // Skip for all buttons — the caller's commit handlers (e.g.
      // commitAllPendingGroupInputs) will add the pending value instead.
      // Adding here would insert a warning that shifts the DOM before the
      // button click fires.
      if (target?.closest('button, a, [role="button"]')) return;
    } else if (isReduxControlled && target?.closest('footer')) {
      // For controlled inputs that don't skip all buttons, still skip for
      // wizard footer buttons (Next, Back, etc.) whose beforeNext handlers
      // commit the pending value. Adding a chip on blur here would shift
      // the layout and prevent the footer click from registering.
      return;
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
      isCompact={isCompact}
      numLabels={CHIP_COLLAPSE_THRESHOLD}
      expandedText='Show less'
      collapsedText={
        list.length > CHIP_COLLAPSE_THRESHOLD
          ? `${list.length - CHIP_COLLAPSE_THRESHOLD} more`
          : undefined
      }
    >
      {list.map((group) => (
        <Label
          key={group}
          color='blue'
          isCompact={isCompact}
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
              <LabelGroup
                isCompact={isCompact}
                numLabels={CHIP_COLLAPSE_THRESHOLD}
                expandedText='Show less'
                collapsedText={
                  list.length > CHIP_COLLAPSE_THRESHOLD
                    ? `${list.length - CHIP_COLLAPSE_THRESHOLD} more`
                    : undefined
                }
                className='pf-v6-u-mr-sm'
              >
                {list.map((labelItem) => (
                  <Label
                    key={labelItem}
                    color='blue'
                    isCompact={isCompact}
                    onClose={(e) => handleRemoveItem(e, labelItem)}
                  >
                    {labelItem.length > truncateLength
                      ? `${labelItem.slice(0, truncateLength)}...`
                      : labelItem}
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
