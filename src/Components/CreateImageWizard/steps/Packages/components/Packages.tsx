import React, { useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Stack,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import { useListRepositoriesQuery } from '@/store/api/contentSources';
import { selectDistribution } from '@/store/slices/wizard';

import PackageSearch from './PackageSearch';
import PackagesTable from './PackagesTable';
import RepositoryModal from './RepositoryModal';

import {
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '../../../../../constants';
import { useAppSelector } from '../../../../../store/hooks';
import { getEpelUrlForDistribution } from '../../../../../Utilities/epel';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

const Packages = () => {
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
        <Stack>
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
                  onOpenChange={(isOpen) =>
                    setIsPackageTypeDropdownOpen(isOpen)
                  }
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
        </Stack>
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
