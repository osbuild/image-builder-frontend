import React, { useState } from 'react';

import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  Popover,
  Select,
  SelectOption,
  SelectVariant,
  ValidatedOptions,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, HelpIcon } from '@patternfly/react-icons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useDispatch } from 'react-redux';
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
  handleClose: any;
  handleToggle: any;
  isOpen: boolean;
  setIsOpen: any;
};

const RegionsSelect = ({
  composeId,
  handleClose,
  handleToggle,
  isOpen,
  setIsOpen,
}: RegionsSelectPropTypes) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const titleId = 'Clone this image';
  const [validated, setValidated] = useState<ValidatedOptions>(
    ValidatedOptions.default
  );
  const [helperTextInvalid] = useState(
    'Select at least one region to share to.'
  );
  const [cloneCompose] = useCloneComposeMutation();

  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId,
  });

  if (!isSuccess) {
    return undefined;
  }

  const options = AWS_REGIONS;

  const handleSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string
  ): void => {
    let nextSelected;
    if (selected.includes(selection)) {
      nextSelected = selected.filter((region) => region !== selection);
      setSelected(nextSelected);
    } else {
      nextSelected = [...selected, selection];
      setSelected(nextSelected);
    }
    nextSelected.length === 0
      ? setValidated(ValidatedOptions.error)
      : setValidated(ValidatedOptions.default);
  };

  const handleClear = () => {
    setSelected([]);
    setIsOpen(false);
    setValidated(ValidatedOptions.error);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const requests = generateRequests(composeId, composeStatus, selected);
    // https://redux-toolkit.js.org/rtk-query/usage/mutations#frequently-used-mutation-hook-return-values
    // If you want to immediately access the result of a mutation, you need to chain `.unwrap()`
    // if you actually want the payload or to catch the error.
    // We do this so we can dispatch the appropriate notification (success or failure).
    await Promise.all(requests.map((request) => cloneCompose(request).unwrap()))
      .then(() => {
        setIsSaving(false);
        navigate(resolveRelPath(''));
        dispatch(
          addNotification({
            variant: 'success',
            title: 'Your image is being shared',
          })
        );
      })
      .catch((err) => {
        navigate(resolveRelPath(''));
        // TODO The error should be typed.
        dispatch(
          addNotification({
            variant: 'danger',
            title: 'Your image could not be shared',
            description: `Status code ${err.status}: ${err.data.errors[0].detail}`,
          })
        );
      });
  };

  return (
    <Form>
      <span id={titleId} hidden>
        Select a region
      </span>
      <FormGroup
        label="Select region"
        isRequired
        validated={validated}
        helperTextInvalid={helperTextInvalid}
        helperTextInvalidIcon={<ExclamationCircleIcon />}
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
            <button
              type="button"
              aria-label="More info for name field"
              onClick={(e) => e.preventDefault()}
              aria-describedby="simple-form-name-01"
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        }
      >
        <Select
          variant={SelectVariant.typeaheadMulti}
          typeAheadAriaLabel="Select a region"
          onToggle={handleToggle}
          onSelect={handleSelect}
          onClear={handleClear}
          selections={selected}
          isOpen={isOpen}
          aria-labelledby={titleId}
          placeholderText="Select a region"
          menuAppendTo="parent"
          validated={validated}
          maxHeight="25rem"
        >
          {options.map((option, index) => (
            <SelectOption
              isDisabled={option.disableRegion}
              key={index}
              value={option.value}
              {...(option.description && { description: option.description })}
            />
          ))}
        </Select>
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
