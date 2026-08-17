import React, { ReactElement, useEffect, useMemo, useState } from 'react';

import { Content, Label } from '@patternfly/react-core';
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { EPEL_10_REPO_DEFINITION } from '@/constants';
import {
  useGetArchitecturesQuery,
  useSecuritySummary,
} from '@/store/api/backend';
import {
  ApiRepositoryCollectionResponseRead,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPackage,
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectArchitecture,
  selectDistribution,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectRecommendedRepositories,
  selectWizardMode,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';

import EmptySearch from './EmptySearch';
import RemovePackageButton from './RemovePackageButton';
import RetirementDate from './RetirementDate';

type PackagesTableProps = {
  isSuccessEpelRepo: boolean;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
};

const PackagesTable = ({ isSuccessEpelRepo, epelRepo }: PackagesTableProps) => {
  const dispatch = useAppDispatch();
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const wizardMode = useAppSelector(selectWizardMode);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const modules = useAppSelector(selectModules);

  const { packages: requiredPkgNames } = useSecuritySummary();
  const requiredSet = useMemo(
    () => new Set(requiredPkgNames),
    [requiredPkgNames],
  );

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useGetArchitecturesQuery({ distribution });

  const distroUrls = useMemo(() => {
    const urls = distroRepositories
      ?.find((archItem) => archItem.arch === arch)
      ?.repositories.filter((repo) => !!repo.baseurl)
      .map((repo) => repo.baseurl!);
    return urls ?? [];
  }, [distroRepositories, arch]);

  const epelRepoUrl =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const [
    searchPackageInfo,
    { data: dataPackageInfo, isSuccess: isSuccessPackageInfo },
  ] = useSearchRpmMutation();

  useEffect(() => {
    if (
      wizardMode !== 'create' &&
      isSuccessDistroRepositories &&
      packages.length > 0
    ) {
      searchPackageInfo({
        apiContentUnitSearchRequest: {
          exact_names: packages.map((pkg) => pkg.name),
          urls: [...distroUrls, epelRepoUrl],
          include_package_sources: true,
        },
      });
    }
  }, [isSuccessDistroRepositories, distroUrls]);

  useEffect(() => {
    if (!isSuccessPackageInfo) return;

    dataPackageInfo.forEach((rpm) => {
      const existingPackage = packages.find(
        (pkg) => pkg.name === rpm.package_name,
      );
      if (!existingPackage) return;

      const enabledModule = modules.find((m) =>
        rpm.package_sources?.some(
          (s) => s.name === m.name && s.stream === m.stream,
        ),
      );

      if (enabledModule) {
        const source = rpm.package_sources?.find(
          (s) =>
            s.name === enabledModule.name && s.stream === enabledModule.stream,
        );
        dispatch(
          addPackage({
            ...existingPackage,
            type: 'module',
            module_name: enabledModule.name,
            stream: enabledModule.stream,
            ...(source?.end_date && { end_date: source.end_date }),
          }),
        );
      } else if (rpm.package_sources?.[0]?.end_date) {
        dispatch(
          addPackage({
            ...existingPackage,
            end_date: rpm.package_sources[0].end_date,
          }),
        );
      }
    });
  }, [dataPackageInfo, dispatch, isSuccessPackageInfo, modules]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const isGroupExpanded = (name: string) => expandedGroups.has(name);

  const setGroupsExpanded = (name: string, isExpanding: boolean) => {
    const newSet = new Set(expandedGroups);
    if (isExpanding) {
      newSet.add(name);
    } else {
      newSet.delete(name);
    }
    setExpandedGroups(newSet);
  };

  const handleRemovePackage = (pkg: IBPackageWithRepositoryInfo) => {
    dispatch(removePackage(pkg.name));
    if (pkg.type === 'module' && pkg.module_name) {
      dispatch(removeModule(pkg.module_name));
    }
    if (
      isSuccessEpelRepo &&
      epelRepo &&
      epelRepo.data &&
      packages.filter((p) => p.repository === 'recommended').length === 1 &&
      groups.filter((grp) => grp.repository === 'recommended').length === 0
    ) {
      dispatch(removeRecommendedRepository(epelRepo.data[0]));
    }
  };

  const handleRemoveGroup = (grp: GroupWithRepositoryInfo) => {
    dispatch(removePackageGroup(grp.name));
    if (
      isSuccessEpelRepo &&
      epelRepo &&
      epelRepo.data &&
      groups.filter((g) => g.repository === 'recommended').length === 1 &&
      packages.filter((pkg) => pkg.repository === 'recommended').length === 0
    ) {
      dispatch(removeRecommendedRepository(epelRepo.data[0]));
    }
  };

  const composePkgTable = () => {
    let rows: ReactElement[] = [];

    rows = rows.concat(
      groups.map((grp, rowIndex) => (
        <Tbody
          key={`${grp.name}-${grp.repository || 'default'}`}
          isExpanded={isGroupExpanded(grp.name)}
        >
          <Tr data-testid='package-row'>
            <Td
              expand={{
                rowIndex: rowIndex,
                isExpanded: isGroupExpanded(grp.name),
                onToggle: () =>
                  setGroupsExpanded(grp.name, !isGroupExpanded(grp.name)),
                expandId: `${grp.name}-expandable`,
              }}
            />
            <Td>@{grp.name}</Td>
            <Td>N/A</Td>
            <Td>N/A</Td>
            <Td>
              <RemovePackageButton
                item={grp}
                onRemove={(item) =>
                  handleRemoveGroup(item as GroupWithRepositoryInfo)
                }
              />
            </Td>
          </Tr>
          <Tr isExpanded={isGroupExpanded(grp.name)}>
            <Td colSpan={5}>
              <ExpandableRowContent>
                <div
                  style={
                    grp.package_list?.length
                      ? { maxHeight: '40em', overflow: 'scroll' }
                      : {}
                  }
                >
                  {grp.package_list?.length ? (
                    <Table
                      variant='compact'
                      data-testid='group-included-packages-table'
                    >
                      <Tbody>
                        {grp.package_list.map((pkg: string) => (
                          <Tr key={`details-${pkg}`}>
                            <Td>{pkg}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Content>This group has no packages</Content>
                  )}
                </div>
              </ExpandableRowContent>
            </Td>
          </Tr>
        </Tbody>
      )),
    );

    // Render required (oscap) packages first, then user-added packages
    const orderedPackages = [
      ...packages.filter((pkg) => requiredSet.has(pkg.name)),
      ...packages.filter((pkg) => !requiredSet.has(pkg.name)),
    ];

    rows = rows.concat(
      orderedPackages.map((pkg) => {
        const isRequired = requiredSet.has(pkg.name);
        return (
          <Tbody
            key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
          >
            <Tr
              data-testid={isRequired ? 'required-package-row' : 'package-row'}
            >
              <Td>&nbsp;</Td>
              <Td>
                {pkg.name} {isRequired && <Label isCompact>Required</Label>}
              </Td>
              <Td>{pkg.stream ? pkg.stream : '--'}</Td>
              <Td>
                <RetirementDate date={pkg.end_date} />
              </Td>
              <Td>
                <RemovePackageButton
                  item={pkg}
                  isRequired={isRequired}
                  onRemove={(item) =>
                    handleRemovePackage(item as IBPackageWithRepositoryInfo)
                  }
                />
              </Td>
            </Tr>
          </Tbody>
        );
      }),
    );
    return rows;
  };

  const bodyContent = useMemo(() => {
    if (packages.length === 0 && groups.length === 0) {
      return <EmptySearch />;
    }
    return composePkgTable();
    // Would need significant rewrite to fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, groups, recommendedRepositories, expandedGroups, requiredSet]);

  return (
    <Table data-testid='packages-table' style={{ tableLayout: 'fixed' }}>
      <Thead>
        <Tr>
          <Th width={10} aria-label='Expanded' />
          <Th width={40}>Name</Th>
          <Th width={25}>Application stream</Th>
          <Th width={25}>Retirement date</Th>
          <Th aria-label='Remove package' />
        </Tr>
      </Thead>
      {bodyContent}
    </Table>
  );
};

export default PackagesTable;
