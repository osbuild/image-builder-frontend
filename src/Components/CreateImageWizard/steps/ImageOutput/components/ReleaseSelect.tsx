import React, { ReactElement, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import {
  ON_PREM_RELEASES,
  RELEASES,
  RHEL_10,
  RHEL_10_FULL_SUPPORT,
  RHEL_10_MAINTENANCE_SUPPORT,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
} from '../../../../../constants';
import { useIsOnPremise } from '../../../../../Hooks';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { Distributions } from '../../../../../store/imageBuilderApi';
import {
  changeDistribution,
  changeRegistrationType,
  selectDistribution,
} from '../../../../../store/wizardSlice';
import isRhel from '../../../../../Utilities/isRhel';
import { toMonthAndYear } from '../../../../../Utilities/time';

const ReleaseSelect = () => {
  // What the UI refers to as the "release" is referred to as the "distribution" in the API.
  // The Redux store follows the API convention, and data read from or to the store will use
  // the word "Distribution" instead of "Release".
  const distribution = useAppSelector(selectDistribution);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showDevelopmentOptions, setShowDevelopmentOptions] = useState(false);
  const isOnPremise = useIsOnPremise();

  const releases = isOnPremise ? ON_PREM_RELEASES : RELEASES;

  const handleSelect = (
    _event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    if (selection === undefined) return;
    if (selection !== ('loader' as Distributions)) {
      if (!isRhel(selection as Distributions)) {
        dispatch(changeRegistrationType('register-later'));
      } else {
        dispatch(changeRegistrationType('register-now-rhc'));
      }
      dispatch(changeDistribution(selection as Distributions));
      setIsOpen(false);
    }
  };

  const handleExpand = () => {
    setShowDevelopmentOptions(true);
  };

  const setDescription = (key: Distributions) => {
    if (isOnPremise) {
      return '';
    }

    let fullSupportEnd = '';
    let maintenanceSupportEnd = '';

    if (key === RHEL_8) {
      fullSupportEnd = toMonthAndYear(RHEL_8_FULL_SUPPORT[1]);
      maintenanceSupportEnd = toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[1]);
    }

    if (key === RHEL_9) {
      fullSupportEnd = toMonthAndYear(RHEL_9_FULL_SUPPORT[1]);
      maintenanceSupportEnd = toMonthAndYear(RHEL_9_MAINTENANCE_SUPPORT[1]);
    }

    if (key === RHEL_10) {
      fullSupportEnd = toMonthAndYear(RHEL_10_FULL_SUPPORT[1]);
      maintenanceSupportEnd = toMonthAndYear(RHEL_10_MAINTENANCE_SUPPORT[1]);
    }

    if (isRhel(key)) {
      return `Full support ends: ${fullSupportEnd} | Maintenance support ends: ${maintenanceSupportEnd}`;
    }
  };

  const setSelectOptions = () => {
    const options: ReactElement[] = [];
    const filteredRhel = new Map(
      [...releases].filter(([key]) => {
        if (isOnPremise) {
          return key === distribution;
        }

        // Only show non-RHEL distros if expanded
        if (showDevelopmentOptions) {
          return true;
        }
        return isRhel(key);
      }),
    );

    filteredRhel.forEach((value, key) => {
      options.push(
        <SelectOption
          key={value}
          value={key}
          description={setDescription(key as Distributions)}
        >
          {releases.get(key)}
        </SelectOption>,
      );
    });

    return options;
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      data-testid='release_select'
      style={
        {
          minWidth: '50%',
          maxWidth: '100%',
        } as React.CSSProperties
      }
    >
      {releases.get(distribution)}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={true} label='Release'>
      <Select
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        selected={distribution}
        onSelect={handleSelect}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {setSelectOptions()}
          {!showDevelopmentOptions &&
            // Hide this for on-prem since the host
            // could be centos or fedora
            !isOnPremise && (
              <SelectOption
                onClick={(ev) => {
                  // prevents setIsOpen{isOpen} from closing the Wizard
                  ev.stopPropagation();
                  handleExpand();
                }}
                value='loader'
                isLoadButton
              >
                Show options for further development of RHEL
              </SelectOption>
            )}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default ReleaseSelect;
