import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  FormGroup,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useGetSourceListQuery } from '../../../../../store/provisioningApi';
import {
  changeAwsSourceId,
  selectAwsSourceId,
} from '../../../../../store/wizardSlice';

export const AwsSourcesSelect = () => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const sourceId = useAppSelector(selectAwsSourceId);

  const { data, isFetching, isLoading, isSuccess, isError, refetch } =
    useGetSourceListQuery({
      provider: 'aws',
    });

  const sources = data?.data;
  const chosenSource = sources?.find((source) => source.id === sourceId);

  const [selectOptions, setSelectOptions] = useState<(string | undefined)[]>(
    sources ? sources.map((source) => source.name) : []
  );

  useEffect(() => {
    let filteredSources = sources?.map((source) => source.name);

    if (sources && filterValue) {
      filteredSources = sources
        .map((source) => source.name)
        .filter((source: string) =>
          String(source).toLowerCase().includes(filterValue.toLowerCase())
        );
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    if (filteredSources) {
      setSelectOptions(filteredSources);
    }

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (value !== chosenSource?.name) {
      dispatch(changeAwsSourceId(undefined));
    }
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    value: string
  ) => {
    const source = sources?.find((source) => source.name === value);
    dispatch(changeAwsSourceId(source?.id));
    setIsOpen(false);
  };

  const handleClear = () => {
    dispatch(changeAwsSourceId(undefined));
    setInputValue('');
    setFilterValue('');
  };

  const handleToggle = () => {
    // Refetch upon opening (but not upon closing)
    if (!isOpen) {
      refetch();
    }

    setIsOpen(!isOpen);
  };

  const prepareSelectOptions = () => {
    const selectOptionsElement = [];

    selectOptions.map((key, index) =>
      selectOptionsElement.push(
        <SelectOption key={index} value={key}>
          {key}
        </SelectOption>
      )
    );

    if (isFetching) {
      selectOptionsElement.push(
        <SelectOption key="fetching" value="loader">
          <Spinner size="lg" />
        </SelectOption>
      );
    }

    if (isSuccess && selectOptions.length === 0) {
      selectOptionsElement.push(
        <SelectOption key="no_results" value="no_results" isDisabled>
          No results found
        </SelectOption>
      );
    }

    return selectOptionsElement;
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={handleToggle}
      isExpanded={isOpen}
      isDisabled={!isSuccess || isLoading}
      ouiaId="source_select"
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={chosenSource?.name ? chosenSource.name : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select source"
          isExpanded={isOpen}
        />

        {chosenSource?.name && (
          <TextInputGroupUtilities>
            <Button
              variant="plain"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <TimesIcon />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <>
      <FormGroup isRequired label={'Source name'} data-testid="sources">
        <Select
          isScrollable
          isOpen={isOpen}
          selected={chosenSource?.name}
          onSelect={handleSelect}
          onOpenChange={handleToggle}
          toggle={toggle}
          shouldFocusFirstItemOnOpen={false}
        >
          <SelectList>{prepareSelectOptions()}</SelectList>
        </Select>
      </FormGroup>
      <>
        {isError && (
          <Alert
            variant={'danger'}
            isPlain={true}
            isInline={true}
            title={'Sources unavailable'}
          >
            Sources cannot be reached, try again later or enter an AWS account
            ID manually.
          </Alert>
        )}
      </>
    </>
  );
};
