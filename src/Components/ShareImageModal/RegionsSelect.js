import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  Popover,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, HelpIcon } from '@patternfly/react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSelector } from '@reduxjs/toolkit';
import { AWS_REGIONS } from '../../constants';
import { selectClonesById, selectComposeById } from '../../store/composesSlice';
import api from '../../api';
import { cloneAdded } from '../../store/clonesSlice';
import { resolveRelPath } from '../../Utilities/path';

export const selectRegionsToDisable = createSelector(
  [selectComposeById, selectClonesById],
  (compose, clones) => {
    let regions = new Set();
    regions.add(compose.region);
    clones.map((clone) => {
      clone.region &&
        clone.share_with_accounts[0] === compose.share_with_accounts[0] &&
        clone.status !== 'failure' &&
        regions.add(clone.region);
    });

    return regions;
  }
);

const prepareRegions = (regionsToDisable) => {
  const regions = AWS_REGIONS.map((region) => ({
    ...region,
    disabled: regionsToDisable.has(region.value),
  }));

  return regions;
};

const RegionsSelect = ({
  composeId,
  handleClose,
  handleToggle,
  isOpen,
  setIsOpen,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const titleId = 'Clone this image';
  const [validated, setValidated] = useState('default');
  const [helperTextInvalid] = useState(
    'Select at least one region to share to.'
  );

  const compose = useSelector((state) => selectComposeById(state, composeId));

  const regionsToDisable = useSelector((state) =>
    selectRegionsToDisable(state, composeId)
  );
  const [options] = useState(prepareRegions(regionsToDisable));

  const handleSelect = (event, selection) => {
    let nextSelected;
    if (selected.includes(selection)) {
      nextSelected = selected.filter((region) => region !== selection);
      setSelected(nextSelected);
    } else {
      nextSelected = [...selected, selection];
      setSelected(nextSelected);
    }
    nextSelected.length === 0 ? setValidated('error') : setValidated('default');
  };

  const handleClear = () => {
    setSelected([]);
    setIsOpen(false);
    setValidated('error');
  };

  const generateRequests = () => {
    const requests = selected.map((region) => {
      return {
        region: region,
        share_with_accounts: [compose.share_with_accounts[0]],
      };
    });
    return requests;
  };

  const handleSubmit = () => {
    setIsSaving(true);
    const requests = generateRequests();
    Promise.all(
      requests.map((request) =>
        api.cloneImage(composeId, request).then((response) => {
          dispatch(
            cloneAdded({
              clone: {
                ...response,
                request,
                image_status: { status: 'pending' },
              },
              parent: composeId,
            })
          );
        })
      )
    )
      .then(() => {
        navigate(resolveRelPath(''));
        dispatch(
          addNotification({
            variant: 'success',
            title: 'Your image is being shared',
          })
        );

        setIsSaving(false);
      })
      .catch((err) => {
        navigate(resolveRelPath(''));
        dispatch(
          addNotification({
            variant: 'danger',
            title: 'Your image could not be created',
            description: `Status code ${err.response.status}: ${err.response.statusText}`,
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
              isDisabled={option.disabled}
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

RegionsSelect.propTypes = {
  composeId: PropTypes.string,
  handleClose: PropTypes.func,
  handleToggle: PropTypes.func,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
};

export default RegionsSelect;
