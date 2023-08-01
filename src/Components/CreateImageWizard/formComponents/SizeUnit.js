import React, { useState } from 'react';

import {
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../constants';

const SizeUnit = ({ ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unit, setUnit] = useState(props.unit || UNIT_GIB);
  const [size, setSize] = useState(props.size || 1);

  const onToggle = (isOpen) => {
    setIsOpen(isOpen);
  };

  const updateState = (size, unit) => {
    // update state
    setSize(size);
    setUnit(unit);
    // propagate state values to the onChange callback. Use the shadowing
    // variables and not the state values as the state values aren't already
    // updated thus not immediately reflecting what was put in them.
    props.onChange(size, unit);
  };

  const onSelect = (event, selection) => {
    switch (selection) {
      case 'KiB':
        updateState(size, UNIT_KIB);
        break;
      case 'MiB':
        updateState(size, UNIT_MIB);
        break;
      case 'GiB':
        updateState(size, UNIT_GIB);
        break;
    }
    setIsOpen(false);
  };

  return (
    <>
      <TextInput
        className="pf-u-w-50"
        type="text"
        value={size}
        aria-label="Size text input"
        onChange={(v) =>
          updateState(isNaN(parseInt(v)) ? 0 : parseInt(v), unit)
        }
      />
      <Select
        className="pf-u-w-50"
        isOpen={isOpen}
        onToggle={onToggle}
        onSelect={onSelect}
        selections={
          unit === UNIT_KIB ? 'KiB' : unit === UNIT_MIB ? 'MiB' : 'GiB'
        }
        variant={SelectVariant.single}
        aria-label="Unit select"
      >
        {['KiB', 'MiB', 'GiB'].map((u, index) => {
          return <SelectOption key={index} value={u} />;
        })}
      </Select>
    </>
  );
};

SizeUnit.propTypes = {
  size: PropTypes.number.isRequired,
  unit: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SizeUnit;
