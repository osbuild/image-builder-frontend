import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  TextInputGroup,
  TextInputGroupMain,
  Truncate,
} from '@patternfly/react-core/dist/esm';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPendingInput,
  removePendingInput,
  selectForceShowErrors,
  ValidationResult,
} from '@/store/slices/wizard';
import type { MergedListItem } from '@/Utilities/mergeListItems';

import { ValidatedInputHelperText } from './ValidatedInputHelperText';

const DEFAULT_TRUNCATE_LENGTH = 20;
const DEFAULT_MAX_VISIBLE_ITEMS = 4;

type ValidatedListInputProps = {
  ariaLabel: string;
  placeholder: string;
  validator: (items: string[]) => ValidationResult;
  items: MergedListItem[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  truncateLength?: number;
  isCompact?: boolean;
  maxVisibleItems?: number;
  hideAddLabel?: boolean;
  helperText?: string;
  addButtonAriaLabel?: string;
};

export const ValidatedListInput = ({
  ariaLabel,
  placeholder,
  validator,
  items,
  onAdd,
  onRemove,
  truncateLength = DEFAULT_TRUNCATE_LENGTH,
  isCompact = false,
  maxVisibleItems = DEFAULT_MAX_VISIBLE_ITEMS,
  hideAddLabel = false,
  helperText,
  addButtonAriaLabel = 'Add',
}: ValidatedListInputProps) => {
  const dispatch = useAppDispatch();
  const forceShowErrors = useAppSelector(selectForceShowErrors);

  const [inputValue, setInputValue] = useState('');
  // The value from the last rejected add attempt. Errors are derived from it
  // against the current items, so removing a conflicting chip clears them.
  const [attemptedValue, setAttemptedValue] = useState<string | undefined>(
    undefined,
  );
  const helperTextId = useId();

  const hasPendingValue = !!inputValue.trim();

  useEffect(() => {
    if (!hasPendingValue) return;
    dispatch(addPendingInput(helperTextId));
    return () => {
      dispatch(removePendingInput(helperTextId));
    };
  }, [helperTextId, hasPendingValue, dispatch]);

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
    setAttemptedValue(undefined);
  };

  const validate = useCallback(
    (attempt?: string | undefined) => {
      const values = items.map((item) => item.value);
      if (attempt) {
        values.push(attempt);
      }

      return validator(values);
    },
    [items, validator],
  );

  const { errors, warnings, pending } = useMemo(() => {
    const result = validate(attemptedValue);
    const warnings = result.warnings ?? [];

    if (forceShowErrors && hasPendingValue && result.errors.length === 0) {
      return {
        errors: [],
        warnings: [
          ...warnings,
          {
            message: 'Input contains a value that has not been added.',
          },
        ],
        pending: true,
      };
    }

    return {
      errors: result.errors,
      warnings,
      pending: false,
    };
  }, [validate, attemptedValue, hasPendingValue, forceShowErrors]);

  const addItem = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    // Only block the add when the new value itself is the problem (bad
    // format or a duplicate). Pre-existing invalid items in the store must
    // not prevent the user from adding otherwise-valid input.
    const newValueIssues = validate(trimmed).errors.filter(
      (issue) => issue.value === trimmed,
    );
    if (newValueIssues.length > 0) {
      setAttemptedValue(trimmed);
      return;
    }

    onAdd(trimmed);
    setInputValue('');
    setAttemptedValue(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  let validated: 'default' | 'warning' | 'error' = 'default';
  if (warnings.length > 0) {
    validated = 'warning';
  }

  if (errors.length > 0) {
    validated = 'error';
  }

  return (
    <Flex
      flexWrap={{ default: 'nowrap' }}
      data-pending-warning={pending || undefined}
    >
      <FlexItem grow={{ default: 'grow' }}>
        <TextInputGroup validated={validated}>
          <TextInputGroupMain
            aria-label={ariaLabel}
            placeholder={placeholder}
            onChange={onTextInputChange}
            value={inputValue}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, inputValue)}
            inputProps={{
              'aria-describedby': helperTextId,
              'aria-invalid': errors.length > 0 || undefined,
            }}
          >
            {items.length > 0 && (
              <LabelGroup
                isCompact={isCompact}
                numLabels={maxVisibleItems}
                expandedText='Show less'
                collapsedText={
                  items.length > maxVisibleItems
                    ? `${items.length - maxVisibleItems} more`
                    : undefined
                }
                className='pf-v6-u-mr-sm'
              >
                {items.map((item) =>
                  item.required ? (
                    <Label key={item.value}>{item.value}</Label>
                  ) : (
                    <Label
                      key={item.value}
                      color='blue'
                      isCompact={isCompact}
                      onClose={() => onRemove(item.value)}
                      closeBtnAriaLabel={`Remove ${item.value}`}
                    >
                      <Truncate
                        content={item.value}
                        maxCharsDisplayed={truncateLength}
                      />
                    </Label>
                  ),
                )}
              </LabelGroup>
            )}
          </TextInputGroupMain>
        </TextInputGroup>
        <ValidatedInputHelperText
          errors={errors}
          warnings={warnings}
          id={helperTextId}
          variant={validated}
          helperText={
            <>
              {helperText && `${helperText} `}
              Press Enter or click {hideAddLabel ? 'the add icon' : 'Add'}.
            </>
          }
        />
      </FlexItem>
      <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
        <Button
          variant='control'
          aria-label={addButtonAriaLabel}
          icon={<PlusCircleIcon />}
          onClick={() => addItem(inputValue)}
        >
          {!hideAddLabel && 'Add'}
        </Button>
      </FlexItem>
    </Flex>
  );
};
