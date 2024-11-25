import React, { useState, useEffect } from 'react';

import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  FormHelperText,
  Popover,
  Select,
  SelectOption,
  SelectList,
  ValidatedOptions,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  ChipGroup,
  Chip,
} from '@patternfly/react-core';
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import {
  ExclamationCircleIcon,
  HelpIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

import { AWS_REGIONS } from '../../constants';
import {
  ComposeStatus,
  useCloneComposeMutation,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';

const generateRequests = (
  composeId: string,
  composeStatus: ComposeStatus,
  regions: string[]
) => {
  return regions.map((region) => {
    const options =
      composeStatus.request.image_requests[0].upload_request.options;
    return {
      composeId: composeId,
      cloneRequest: {
        region: region,
        share_with_sources:
          'share_with_sources' in options
            ? options.share_with_sources
            : undefined,
        share_with_accounts:
          'share_with_accounts' in options
            ? options.share_with_accounts
            : undefined,
      },
    };
  });
};

type RegionsSelectPropTypes = {
  composeId: string;
  handleClose: () => void;
};

const RegionsSelect = ({ composeId, handleClose }: RegionsSelectPropTypes) => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validated, setValidated] = useState<ValidatedOptions>(
    ValidatedOptions.default
  );

  const initialRegions = AWS_REGIONS;

  const [inputValue, setInputValue] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectOptions, setSelectOptions] = useState(initialRegions);

  // Filter dropdown items when there is a typed input
  useEffect(() => {
    let newSelectOptions = initialRegions;

    if (inputValue) {
      newSelectOptions = initialRegions.filter((region) =>
        region.value.toLowerCase().includes(inputValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            disableRegion: false,
            description: `No results found for "${inputValue}"`,
            value: 'empty',
          },
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
  }, [inputValue, isOpen, initialRegions]);

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
  };

  const onSelect = (value: string) => {
    if (value && value !== 'no results') {
      setSelected(
        selected.includes(value)
          ? selected.filter((selection) => selection !== value)
          : [...selected, value]
      );
      setValidated(ValidatedOptions.success);
    } else {
      setValidated(ValidatedOptions.error);
    }
  };

  const [cloneCompose] = useCloneComposeMutation();

  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId,
  });

  if (!isSuccess) {
    return undefined;
  }

  const handleSubmit = async () => {
    setIsSaving(true);
    const requests = generateRequests(composeId, composeStatus, selected);
    await Promise.allSettled(requests.map((request) => cloneCompose(request)));
    navigate(resolveRelPath(''));
  };

  const handleToggle = () => {
    if (!selected.length) setValidated(ValidatedOptions.error);
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      onClick={handleToggle}
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={handleToggle}
          onChange={onTextInputChange}
          placeholder="Select region"
          isExpanded={isOpen}
        >
          <ChipGroup aria-label="Selected regions">
            {selected.map((selection, index) => (
              <Chip
                key={index}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelect(selection);
                }}
              >
                {selection}
              </Chip>
            ))}
          </ChipGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          {selected.length > 0 && (
            <Button
              variant="plain"
              onClick={() => {
                setInputValue('');
                setSelected([]);
                setValidated(ValidatedOptions.error);
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
    <Form>
      <span id="Clone this image" hidden>
        Select a region
      </span>
      <FormGroup
        label="Select region"
        isRequired
        labelIcon={
          <Popover
            headerContent={<div>Sharing images to other regions</div>}
            bodyContent={
              <div>
                Your image will be built, uploaded to AWS, and shared to the
                regions you select. The shared image will expire within 14 days.
                To permanently access the image, copy the image, which will be
                shared to your account by Red Hat, to your own AWS account.
              </div>
            }
          >
            <Button
              variant="plain"
              aria-label="About regions"
              className="pf-v5-u-pl-sm header-button"
              isInline
            >
              <HelpIcon />
            </Button>
          </Popover>
        }
      >
        <Select
          isScrollable
          isOpen={isOpen}
          selected={selected}
          onSelect={(ev, selection) => onSelect(selection as string)}
          onOpenChange={handleToggle}
          toggle={toggle}
        >
          <SelectList isAriaMultiselectable>
            {selectOptions.map((option) => (
              <SelectOption
                isDisabled={option.disableRegion}
                key={option.value}
                description={option.value}
                value={option.value}
              >
                {option.description}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
        {validated !== 'success' && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem
                icon={<ExclamationCircleIcon />}
                variant={validated}
              >
                Select at least one region to share to.
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
      <ActionGroup>
        <Button
          onClick={handleSubmit}
          variant="primary"
          key="share"
          isDisabled={selected.length === 0 || isSaving}
          isLoading={isSaving}
        >
          Share
        </Button>
        <Button variant="link" onClick={handleClose} key="cancel">
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

export default RegionsSelect;
