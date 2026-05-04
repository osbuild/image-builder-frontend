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

import {
  AMPLITUDE_MODULE_NAME,
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '@/constants';
import { useListRepositoriesQuery } from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectDistribution, selectWizardMode } from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';

import PackageSearch from './PackageSearch';
import PackagesTable from './PackagesTable';
import RepositoryModal from './RepositoryModal';

import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

const Packages = () => {
  const { analytics, isBeta } = useChrome();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const wizardMode = useAppSelector(selectWizardMode);
  const distribution = useAppSelector(selectDistribution);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.COMMUNITY,
    });

  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();
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
      <RepositoryModal
        isRepoModalOpen={isRepoModalOpen}
        setIsRepoModalOpen={setIsRepoModalOpen}
        isSelectingPackage={isSelectingPackage}
        setIsSelectingPackage={setIsSelectingPackage}
        isSelectingGroup={isSelectingGroup}
        epelRepo={epelRepo}
      />
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
          <ToolbarItem>
            <PackageSearch
              packageType={packageType}
              isSuccessEpelRepo={isSuccessEpelRepo}
              epelRepo={epelRepo}
              setIsRepoModalOpen={setIsRepoModalOpen}
              setIsSelectingPackage={setIsSelectingPackage}
              setIsSelectingGroup={setIsSelectingGroup}
              activeStream={activeStream}
              setActiveStream={setActiveStream}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <PackagesTable
        isSuccessEpelRepo={isSuccessEpelRepo}
        epelRepo={epelRepo}
        activeStream={activeStream}
      />
    </>
  );
};

export default Packages;
