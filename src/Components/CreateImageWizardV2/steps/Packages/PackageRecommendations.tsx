import React, { useEffect, useState } from 'react';

import {
  Alert,
  Bullseye,
  Button,
  ExpandableSection,
  Icon,
  Panel,
  PanelMain,
  PanelMainBody,
  Spinner,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { OptimizeIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '../../../../store/hooks';
import { useRecommendPackageMutation } from '../../../../store/imageBuilderApi';
import { addPackage, selectPackages } from '../../../../store/wizardSlice';
import useDebounce from '../../../../Utilities/useDebounce';

const PackageRecommendations = () => {
  const dispatch = useDispatch();

  const undebouncedPackages = useAppSelector(selectPackages);
  const packages = useDebounce(undebouncedPackages);

  const [isExpanded, setIsExpanded] = useState(false);

  const [fetchRecommendedPackages, { data, isSuccess, isLoading, isError }] =
    useRecommendPackageMutation();

  useEffect(() => {
    if (isExpanded && packages.length > 0) {
      (async () => {
        await fetchRecommendedPackages({
          recommendPackageRequest: {
            packages: packages.map((pkg) => pkg.name),
            recommendedPackages: 5,
          },
        });
      })();
    }
  }, [fetchRecommendedPackages, packages, isExpanded]);

  const addAllPackages = () => {
    if (data?.packages?.length) {
      data.packages.forEach((pkg) =>
        dispatch(
          addPackage({
            name: pkg,
            summary: 'Added from recommended packages',
            repository: 'distro',
          })
        )
      );
    }
  };

  const addRecommendedPackage = (pkg: string) => {
    dispatch(
      addPackage({
        name: pkg,
        summary: 'Added from recommended packages',
        repository: 'distro',
      })
    );
  };

  const isRecommendedPackageSelected = (recPkg: string) => {
    const foundInPackages = packages?.some((pkg) => recPkg === pkg.name);
    return foundInPackages;
  };

  return (
    <Panel variant="bordered" className="panel-border">
      <PanelMain>
        <PanelMainBody>
          <ExpandableSection
            toggleContent={
              <>
                <Icon>
                  <OptimizeIcon />
                </Icon>{' '}
                Recommended Red Hat packages
              </>
            }
            onToggle={(_, bool) => setIsExpanded(bool)}
            isExpanded={isExpanded}
          >
            {packages.length === 0 && (
              <>Select packages to generate recommendations.</>
            )}
            {isLoading && <Spinner size="lg" />}
            {isError && (
              <Alert
                title="Recommendations couldn't be fetched"
                variant="danger"
                isPlain
                isInline
              >
                There was an error when fetching package recommendations. Try
                again by changing your selected packages.
              </Alert>
            )}
            {isSuccess && !data?.packages?.length && (
              <>No recommendations found for the set of selected packages</>
            )}
            {isSuccess && data && data?.packages && (
              <>
                <TextContent>
                  <Text>
                    Other users commonly add these packages with the ones you
                    selected.
                  </Text>
                </TextContent>
                <Table variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={80}>Package name</Th>
                      {/*<Th width={50}>Package summary</Th>*/}
                      <Th width={20}>
                        <Button
                          variant="link"
                          component="a"
                          onClick={() => addAllPackages()}
                          isInline
                          data-testid="add-all-recommendations-button"
                        >
                          Add all packages
                        </Button>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.packages.map((pkg) => (
                      <Tr key={pkg}>
                        <Td>{pkg}</Td>
                        {/*<Td>TODO summary</Td>*/}
                        <Td>
                          <Button
                            variant="link"
                            component="a"
                            onClick={() => addRecommendedPackage(pkg)}
                            isInline
                            isDisabled={isRecommendedPackageSelected(pkg)}
                            data-testid="add-recommendation-button"
                          >
                            Add package
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </ExpandableSection>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default PackageRecommendations;
