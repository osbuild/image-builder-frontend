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

import { excludeEUSReposFilter } from '@/Components/CreateImageWizard/steps/Repositories/components/Repositories';
import {
  AMPLITUDE_MODULE_NAME,
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '@/constants';
import { useRecommendPackageMutation } from '@/store/api/backend';
import {
  useListRepositoriesQuery,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  selectArchitecture,
  selectDistribution,
  selectPackages,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import useDebounce from '@/Utilities/useDebounce';

import PackageSearch from './PackageSearch';
import PackagesTable from './PackagesTable';
import RepositoryModal from './RepositoryModal';

import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  PackageRecommendation,
} from '../packagesTypes';

const Packages = () => {
  const { analytics, isBeta } = useChrome();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const version = releaseToVersion(distribution);
  const undebouncedPackages = useAppSelector(selectPackages);
  const packages = useDebounce(undebouncedPackages);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.COMMUNITY,
    });

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useListRepositoriesQuery({
      availableForArch: arch,
      availableForVersion: version,
      ...excludeEUSReposFilter,
      contentType: 'rpm',
      origin: ContentOrigin.REDHAT,
      limit: 100,
      offset: 0,
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

  const [
    fetchRecommendedPackages,
    { data: recommendationsData, isLoading: isLoadingRecommendations },
  ] = useRecommendPackageMutation();

  const [
    fetchRecommendationDescriptions,
    {
      data: dataDescriptions,
      isSuccess: isSuccessDescriptions,
      isLoading: isLoadingDescriptions,
    },
  ] = useSearchRpmMutation();

  useEffect(() => {
    if (!isOnPremise && packages.length > 0) {
      (async () => {
        const response = await fetchRecommendedPackages({
          recommendPackageRequest: {
            packages: packages.map((pkg) => pkg.name),
            recommendedPackages: 5,
            distribution: distribution.replace('-', ''),
          },
        });

        if (
          // there is a mismatch between API type and real data
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          response?.data?.packages &&
          response.data.packages.length > 0
        ) {
          analytics.track(
            `${AMPLITUDE_MODULE_NAME} - Package Recommendations Shown`,
            {
              module: AMPLITUDE_MODULE_NAME,
              isPreview: isBeta(),
              shownRecommendations: response.data.packages,
              selectedPackages: packages.map((pkg) => pkg.name),
              distribution: distribution.replace('-', ''),
              modelVersion: response.data.modelVersion,
            },
          );
        }
      })();
    }
  }, [
    packages,
    distribution,
    fetchRecommendedPackages,
    isOnPremise,
    analytics,
    isBeta,
  ]);

  useEffect(() => {
    if (
      isSuccessDistroRepositories &&
      // there is a mismatch between API type and real data
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      distroRepositories?.data &&
      recommendationsData?.packages &&
      recommendationsData.packages.length > 0
    ) {
      const distroRepoUrls = distroRepositories.data.map(
        (repo) => repo.url || '',
      );

      fetchRecommendationDescriptions({
        apiContentUnitSearchRequest: {
          exact_names: recommendationsData.packages,
          urls: distroRepoUrls,
        },
      });
    }
  }, [
    isSuccessDistroRepositories,
    distroRepositories,
    recommendationsData,
    fetchRecommendationDescriptions,
  ]);

  const recommendationsWithDescriptions: PackageRecommendation[] =
    isSuccessDescriptions && recommendationsData?.packages
      ? recommendationsData.packages.map((pkgName) => {
          const description = dataDescriptions.find(
            (p) => p.package_name === pkgName,
          );
          return {
            name: pkgName,
            summary: description?.summary || '',
          };
        })
      : [];

  const handleRecommendationSelected = (packageName: string) => {
    if (!isOnPremise) {
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Recommended Package Added`, {
        module: AMPLITUDE_MODULE_NAME,
        isPreview: isBeta(),
        packageName,
        selectedPackages: packages.map((pkg) => pkg.name),
        shownRecommendations: recommendationsData?.packages || [],
        distribution: distribution.replace('-', ''),
        modelVersion: recommendationsData?.modelVersion,
      });
    }
  };

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
              recommendations={recommendationsWithDescriptions}
              isLoadingRecommendations={
                isLoadingRecommendations || isLoadingDescriptions
              }
              onRecommendationSelected={handleRecommendationSelected}
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
