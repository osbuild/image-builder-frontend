import React, { useEffect, useState } from 'react';

import path from 'path';

import { TextInput } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';

export const MountPointValidPrefixes = [
  '/app',
  '/boot',
  '/data',
  '/home',
  '/opt',
  '/srv',
  '/tmp',
  '/usr',
  '/usr/local',
  '/var',
];

const MountPoint = ({ ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState('/');
  const [suffix, setSuffix] = useState('');

  // split
  useEffect(() => {
    for (const p of MountPointValidPrefixes) {
      if (props.mountpoint.startsWith(p)) {
        setPrefix(p);
        setSuffix(props.mountpoint.substring(p.length));
        return;
      }
    }
  }, []);

  useEffect(() => {
    let suf = suffix;
    let mp = prefix;
    if (suf) {
      if (mp !== '/' && suf[0] !== '/') {
        suf = '/' + suf;
      }

      mp += suf;
    }

    props.onChange(path.normalize(mp));
  }, [prefix, suffix]);

  const onToggle = (isOpen) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event, selection) => {
    setPrefix(selection);
    setIsOpen(false);
  };

  return (
    <>
      <Select
        ouiaId="mount-point"
        className="pf-u-w-50"
        isOpen={isOpen}
        onToggle={(_event, isOpen) => onToggle(isOpen)}
        onSelect={onSelect}
        selections={prefix}
        variant={SelectVariant.single}
        isDisabled={prefix === '/' ? true : false}
      >
        {MountPointValidPrefixes.map((pfx, index) => {
          return <SelectOption key={index} value={pfx} />;
        })}
      </Select>
      {prefix !== '/' && !prefix.startsWith('/boot') && (
        <TextInput
          ouiaId="mount-suffix"
          className="pf-u-w-50"
          type="text"
          value={suffix}
          aria-label="Mount point suffix text input"
          onChange={(_event, v) => setSuffix(v)}
        />
      )}
    </>
  );
};

MountPoint.propTypes = {
  mountpoint: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MountPoint;
