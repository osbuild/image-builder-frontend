import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Select,
  SelectOption,
  SelectList,
  SelectOptionProps,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  Spinner,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryDefinition,
} from '@reduxjs/toolkit/dist/query';
import { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate';

import {
  GetSourceListApiArg,
  V1ListSourceResponse,
} from '../../../store/provisioningApi';

function mapInputOptions(
  inputOptions: [string | number, string][] | string[]
): SelectOptionProps[] {
  if (inputOptions.length === 0) {
    return [
      {
        isDisabled: true,
        children: `No results"`,
        value: 'no results',
      },
    ];
  }
  return inputOptions.map((input) => {
    if (typeof input === 'string') {
      return { isDisabled: false, value: input, children: input };
    }
    return { isDisabled: false, value: input[0], children: input[1] };
  });
}

function getLabel(
  val: string | number,
  inputOptions: [string | number, string][] | string[]
): string {
  if (typeof val === 'string') {
    return val;
  }
  let ret: string = '';
  inputOptions.forEach((input) => {
    if (input[0] === val) {
      ret = input[1];
    }
  });
  return ret;
}

type TypeAheadSelectPropType<T extends string | number> = {
  inputOptions: [T, string][] | string[];
  fieldID: string;
  placeholderText: string;
  selected: [T, string] | string;
  setSelected: Dispatch<SetStateAction<[T, string] | string>>;
  isFetching?: boolean;
  isError?: boolean;
  refetch?: () => QueryActionCreatorResult<
    QueryDefinition<
      GetSourceListApiArg,
      BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        {},
        FetchBaseQueryMeta
      >,
      never,
      V1ListSourceResponse,
      'provisioningApi'
    >
  >;
};

/**
 * Enhanced TypeAheadSelect from the pattern fly
 * pattern https://www.patternfly.org/components/menus/select#typeahead
 *
 * The TypeAheadSelect component allows a user to select an element form a list
 * of options. The user can also filter the elements by entering some text in
 * the text input.
 *
 * The component can function in two different modes. Either in a mode where the
 * key and value of the selectable items are the same, or in a mode where they
 * and value are different. In the second operational mode, the key can be some
 * number and the value a label of any kind.
 *
 * @param inputOptions a list of elements to be turned into select options.
 * Either be a list of tuples or a list of string depending on the mode the
 * component must operate in. If a tuple is passed, the first element of the
 * tuple will end up being the key and the second element will be the value.
 *
 * @param selected the currently selected element. Either be a tuple or a string
 * depending of the operating mode.
 * @param setSelected a function to update the selected value.
 *
 * @param isFetching if provided and set to true, the component will show a
 * loading spinner when the data is on the fly.
 * @param isError if provided and set to true, the component will disable
 * itself.
 * @param refetch if provided, the component will use the refetch function to
 * ask for a refresh of the data that makes the select options.
 */
function TypeAheadSelect<T extends string | number>({
  inputOptions,
  selected,
  setSelected,
  fieldID,
  placeholderText,
  isFetching,
  isError,
  refetch,
}: TypeAheadSelectPropType<T>) {
  const [isOpen, setIsOpen] = useState(false);
  // The label of the selected element is displayed in the toggle menu. Since
  // the component is accepting two kinds of options (tuples or string), find
  // out which one it is and extract the keys and labels accordingly.
  const selectedTypeIsdStringOnly = typeof selected === 'string';
  const selectedKey = selectedTypeIsdStringOnly ? selected : selected[0];
  const selectedLabel = selectedTypeIsdStringOnly ? selected : selected[1];
  const [inputValue, setInputValue] = useState<string>(selectedLabel);
  // keep the inputValue in sync with the selectedLabel
  const [prevSelectedLabel, setPrevSelectedLabel] = useState(selectedLabel);
  if (prevSelectedLabel !== selectedLabel) {
    setPrevSelectedLabel(selectedLabel);
    setInputValue(selectedLabel);
  }
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>(
    mapInputOptions(inputOptions)
  );
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = mapInputOptions(inputOptions);

    // Filter menu items based on the text input value when one exists
    if (filterValue) {
      newSelectOptions = newSelectOptions.filter((menuItem) =>
        String(menuItem.children)
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isDisabled: false,
            children: `No results found for "${filterValue}"`,
            value: 'no results',
          },
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
  }, [filterValue, inputOptions]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && refetch) {
      refetch();
    }
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    if (value && value !== 'no results') {
      setInputValue(getLabel(value, inputOptions));
      setFilterValue('');
      if (selectedTypeIsdStringOnly) {
        setSelected(value as string);
      } else {
        setSelected([value as T, getLabel(value, inputOptions)]);
      }
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItem(null);
  };

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (
          focusedItemIndex === null ||
          focusedItemIndex === selectOptions.length - 1
        ) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus ? indexToFocus : 0);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[
        indexToFocus ? indexToFocus : 0
      ];
      setActiveItem(
        `select-typeahead-${String(focusedItem.value).replace(' ', '-')}`
      );
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter(
      (option) => !option.isDisabled
    );
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex
      ? enabledMenuItems[focusedItemIndex]
      : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        if (isOpen && focusedItem.value !== 'no results') {
          setInputValue(String(focusedItem.children));
          setFilterValue('');
          if (selectedTypeIsdStringOnly) {
            setSelected(focusedItem.value as string);
          } else {
            setSelected([focusedItem.value as T, String(focusedItem.children)]);
          }
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);

        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          aria-label={fieldID + 'typeahead-select-input'}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholderText}
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={fieldID + 'typeahead-select-input'}
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                if (selectedTypeIsdStringOnly) {
                  setSelected('');
                } else {
                  setSelected([0 as T, '']);
                }
                setInputValue('');
                setFilterValue('');
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id={fieldID}
      isOpen={isOpen}
      selected={selectedKey}
      onSelect={onSelect}
      onOpenChange={() => {
        setIsOpen(false);
      }}
      toggle={toggle}
      aria-disabled={isError}
    >
      <SelectList id={fieldID + '-listbox'}>
        {selectOptions.map((option, index) => (
          <SelectOption
            key={option.value}
            isFocused={focusedItemIndex === index}
            className={option.className}
            onClick={() => {
              if (option.value) {
                if (selectedTypeIsdStringOnly) {
                  setSelected(option.value as string);
                } else {
                  setSelected([option.value as T, String(option.children)]);
                }
              }
            }}
            id={fieldID + `-${String(option.value).replace(' ', '-')}`}
            {...option}
            ref={null}
          />
        ))}
        {isFetching && (
          <SelectOption>
            <Spinner size="lg" />
          </SelectOption>
        )}
      </SelectList>
    </Select>
  );
}

export default TypeAheadSelect;
