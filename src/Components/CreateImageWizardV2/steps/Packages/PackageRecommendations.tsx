import React, { useEffect, useState } from 'react';

import {
  Alert,
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

const PackageRecommendations = () => {
  const dispatch = useDispatch();

  const packages = useAppSelector(selectPackages);

  const [isExpanded, setIsExpanded] = useState(false);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const [fetchRecommendedPackages, { data, isSuccess, isLoading, isError }] =
    useRecommendPackageMutation();

  useEffect(() => {
    const getRecommendedPackages = async () => {
      await fetchRecommendedPackages({
        recommendPackageRequest: {
          packages: packages.map((pkg) => pkg.name),
          recommendedPackages: 5,
        },
      });
    };

    if (packages.length > 0) {
      getRecommendedPackages();
    }
  }, [fetchRecommendedPackages, packages]);

  const addAllPackages = () => {
    if (data) {
      for (const pkg in data[0].packages) {
        dispatch(
          addPackage({
            name: data[0].packages[pkg],
            summary: 'Added from recommended packages',
            repository: 'distro',
          })
        );
      }
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
    const foundInPackages = packages.some((pkg) => recPkg === pkg.name);
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
            onToggle={onToggle}
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
            {isSuccess && !data && (
              <>No recommendations found for the set of selected packages</>
            )}
            {isSuccess && data && data[0].packages && (
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
                    {data[0].packages.map((pkg) => (
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
