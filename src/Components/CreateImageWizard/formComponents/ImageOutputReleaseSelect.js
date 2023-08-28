import React, { useState } from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { RELEASES } from '../../../constants';
import isRhel from '../../../Utilities/isRhel';

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
        <SelectOption key={value} value={key}>
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
