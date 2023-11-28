import React, { ReactElement, useContext, useRef, useState } from 'react';

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  FormGroup,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../constants';
import { Distributions } from '../../../../store/imageBuilderApi';
import isRhel from '../../../../Utilities/isRhel';
import { ImageWizardContext } from '../../ImageWizardContext';

/**
 * Allows the user to choose the release they want to build.
 * Follows the PF5 pattern: https://www.patternfly.org/components/menus/select#view-more
 */
const ReleaseSelect = () => {
  const { releaseState } = useContext(ImageWizardContext);
  const [release, setRelease] = releaseState;
  // By default the component doesn't show the Centos releases and only the RHEL
  // ones. The user has the option to click on a button to make them appear.
  const [showDevelopmentOptions, setShowDevelopmentOptions] = useState(false);
  const releaseOptions = () => {
    const options: ReactElement[] = [];
    const filteredRhel = new Map<string, string>();
    RELEASES.forEach((value, key) => {
      // Only show non-RHEL distros if expanded
      if (showDevelopmentOptions || isRhel(key)) {
        filteredRhel.set(key, value);
      }
    });
    filteredRhel.forEach((value, key) => {
      if (value && key) {
        options.push(
          <SelectOption key={value} value={key} label={key}>
            {RELEASES.get(key)}
          </SelectOption>
        );
      }
    });

    return options;
  };

  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const viewMoreRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    if (value !== 'loader') {
      if (typeof value === 'string') {
        setRelease(value as Distributions);
      }
      setIsOpen(false);
      toggleRef?.current?.focus(); // Only focus the toggle when a non-loader option is selected
    }
  };

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      {RELEASES.get(release)}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={true} label="Release" data-testid="release-select">
      <Select
        ouiaId="release_select"
        id="release_select"
        isOpen={isOpen}
        selected={release}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={{ toggleNode: toggle, toggleRef }}
      >
        <SelectList>
          {releaseOptions()}
          <SelectOption
            {...(!showDevelopmentOptions && { isLoadButton: true })}
            onClick={() => setShowDevelopmentOptions(true)}
            value="loader"
            ref={viewMoreRef}
          >
            {!showDevelopmentOptions
              ? 'Show options for further development of RHEL'
              : undefined}
          </SelectOption>
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default ReleaseSelect;
