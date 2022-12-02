import React, { useEffect, useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';

const FileSystemConfigToggle = ({ ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [selected, setSelected] = useState(
    getState()?.values?.['file-system-config-toggle'] || 'auto'
  );

  useEffect(() => {
    change(input.name, selected);
  }, [selected]);

  const onClick = (_, evt) => {
    setSelected(evt.currentTarget.id);
  };

  return (
    <>
      <ToggleGroup
        data-testid="fsc-paritioning-toggle"
        aria-label="Automatic partitioning toggle"
      >
        <ToggleGroupItem
          onChange={onClick}
          text="Use automatic partitioning"
          buttonId="auto"
          isSelected={selected === 'auto'}
        />
        <ToggleGroupItem
          onChange={onClick}
          text="Manually configure partitions"
          buttonId="manual"
          isSelected={selected === 'manual'}
          data-testid="file-system-config-toggle-manual"
        />
      </ToggleGroup>
    </>
  );
};

export default FileSystemConfigToggle;
