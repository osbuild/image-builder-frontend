import React, { ReactElement, useState } from 'react';

import { FormGroup } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import { ARCHES } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { ImageRequest } from '../../../../store/imageBuilderApi';
import {
  changeArchitecture,
  selectArchitecture,
} from '../../../../store/wizardSlice';

const ArchSelect = () => {
  const arch = useAppSelector(selectArchitecture);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const setArch = (
    _event: React.MouseEvent,
    selection: ImageRequest['architecture']
  ) => {
    dispatch(changeArchitecture(selection));
    setIsOpen(false);
  };

  const setSelectOptions = () => {
    const options: ReactElement[] = [];
    const arches = ARCHES.filter((a) => {
      // we don't want to support cross-arch
      // builds for on-prem for now
      if (process.env.IS_ON_PREMISE) {
        return a === arch;
      }
      return true;
    });
    arches.forEach((arch) => {
      options.push(
        <SelectOption key={arch} value={arch}>
          {arch}
        </SelectOption>
      );
    });

    return options;
  };

  return (
    <FormGroup isRequired={true} label="Architecture">
      <Select
        ouiaId="arch_select"
        variant={SelectVariant.single}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={setArch}
        selections={arch}
        isOpen={isOpen}
      >
        {setSelectOptions()}
      </Select>
    </FormGroup>
  );
};

export default ArchSelect;
