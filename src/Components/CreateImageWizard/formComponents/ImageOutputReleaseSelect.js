import React, { useState } from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { FormGroup } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';

import {
  RELEASES,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
} from '../../../constants';
import isRhel from '../../../Utilities/isRhel';
import { toMonthAndYear } from '../../../Utilities/time';

const ImageOutputReleaseSelect = ({ label, isRequired, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);
  const [showDevelopmentOptions, setShowDevelopmentOptions] = useState(false);

  const setRelease = (_, selection) => {
    change(input.name, selection);
    setIsOpen(false);
  };

  const handleExpand = () => {
    setShowDevelopmentOptions(true);
  };

  const setDescription = (key) => {
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

    if (isRhel(key)) {
      return `Full support ends: ${fullSupportEnd} | Maintenance support ends: ${maintenanceSupportEnd}`;
    }
  };

  const setSelectOptions = () => {
    var options = [];
    const filteredRhel = new Map(
      [...RELEASES].filter(([key]) => {
        // Only show non-RHEL distros if expanded
        if (showDevelopmentOptions) {
          return true;
        }
        return isRhel(key);
      })
    );

    filteredRhel.forEach((value, key) => {
      options.push(
        <SelectOption key={value} value={key} description={setDescription(key)}>
          {RELEASES.get(key)}
        </SelectOption>
      );
    });

    return options;
  };

  return (
    <FormSpy>
      {() => (
        <FormGroup isRequired={isRequired} label={label}>
          <Select
            ouiaId="release_select"
            variant={SelectVariant.single}
            onToggle={() => setIsOpen(!isOpen)}
            onSelect={setRelease}
            selections={RELEASES.get(getState()?.values?.[input.name])}
            isOpen={isOpen}
            {...(!showDevelopmentOptions && {
              loadingVariant: {
                text: 'Show options for further development of RHEL',
                onClick: handleExpand,
              },
            })}
          >
            {setSelectOptions()}
          </Select>
        </FormGroup>
      )}
    </FormSpy>
  );
};

ImageOutputReleaseSelect.propTypes = {
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};

export default ImageOutputReleaseSelect;
