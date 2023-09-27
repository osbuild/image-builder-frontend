import React, { useEffect, useState } from 'react';

import { TextInput } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../constants';

const SizeUnit = ({ ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unit, setUnit] = useState(props.unit || UNIT_GIB);
  const [size, setSize] = useState(props.size || 1);

  useEffect(() => {
    props.onChange(size, unit);
  }, [unit, size]);

  const onToggle = (isOpen) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event, selection) => {
    switch (selection) {
      case 'KiB':
        setUnit(UNIT_KIB);
        break;
      case 'MiB':
        setUnit(UNIT_MIB);
        break;
      case 'GiB':
        setUnit(UNIT_GIB);
        break;
      // no default
    }

    setIsOpen(false);
  };

  return (
    <>
      <TextInput
        ouiaId="size"
        className="pf-u-w-50"
        type="text"
        value={size}
        aria-label="Size text input"
        onChange={(_event, v) => setSize(isNaN(parseInt(v)) ? 0 : parseInt(v))}
      />
      <Select
        ouiaId="unit"
        className="pf-u-w-50"
        isOpen={isOpen}
        onToggle={(_event, isOpen) => onToggle(isOpen)}
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
