import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectWizardMode } from '@/store/slices/wizard';

import PackageSearch from './PackageSearch';
import PackagesTable from './PackagesTable';

const Packages = () => {
  const { analytics, isBeta } = useChrome();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const wizardMode = useAppSelector(selectWizardMode);

  const [packageType, setPackageType] = useState<'packages' | 'groups'>(
    'packages',
  );
  const [isPackageTypeDropdownOpen, setIsPackageTypeDropdownOpen] =
    useState(false);
  const [activeStream, setActiveStream] = useState<string>('');

  useEffect(() => {
    if (!isOnPremise && wizardMode === 'edit') {
      analytics.track(
        `${AMPLITUDE_MODULE_NAME} - Additional Packages Revisited in Edit`,
        {
          module: AMPLITUDE_MODULE_NAME,
          isPreview: isBeta(),
        },
      );
    }
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <FormGroup label='Package type'>
              <Select
                id='package-type-select'
                isOpen={isPackageTypeDropdownOpen}
                selected={packageType}
                onSelect={(_event, value) => {
                  setPackageType(value as 'packages' | 'groups');
                  setIsPackageTypeDropdownOpen(false);
                }}
                onOpenChange={(isOpen) => setIsPackageTypeDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() =>
                      setIsPackageTypeDropdownOpen(!isPackageTypeDropdownOpen)
                    }
                    isExpanded={isPackageTypeDropdownOpen}
                  >
                    {packageType === 'packages'
                      ? 'Individual packages'
                      : 'Package groups'}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value='packages'>
                    Individual packages
                  </SelectOption>
                  <SelectOption value='groups'>Package groups</SelectOption>
                </SelectList>
              </Select>
            </FormGroup>
          </ToolbarItem>
          <ToolbarItem style={{ flex: 1 }}>
            <PackageSearch
              packageType={packageType}
              activeStream={activeStream}
              setActiveStream={setActiveStream}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <PackagesTable />
    </>
  );
};

export default Packages;
