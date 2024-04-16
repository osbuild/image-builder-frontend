import React, { useState } from 'react';

import {
  Button,
  ExpandableSection,
  Form,
  List,
  ListItem,
  Text,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import Repositories from './Repositories';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectPackages,
  selectRecommendedRepositories,
} from '../../../../store/wizardSlice';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

const ManageRepositoriesButton = () => {
  const { isBeta } = useGetEnvironment();
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      iconPosition="right"
      isInline
      icon={<ExternalLinkAltIcon />}
      href={isBeta() ? '/preview/settings/content' : '/settings/content'}
    >
      Create and manage repositories here
    </Button>
  );
};

const RepositoriesStep = () => {
  const packages = useAppSelector(selectPackages);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);

  const [isExpanded, setIsExpanded] = useState(false);
  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Custom repositories
      </Title>
      <Text>
        Select the linked custom repositories from which you can add packages to
        the image.
        <br />
        <ManageRepositoriesButton />
      </Text>
      {recommendedRepos.length > 0 && (
        <ExpandableSection
          toggleText={"Why can't I remove a selected repository?"}
          onToggle={onToggle}
          isExpanded={isExpanded}
          isIndented
        >
          EPEL repository cannot be removed, because packages from it were
          selected. If you wish to remove the repository, please remove
          following packages on the Packages step:
          <List>
            {packages
              .filter((pkg) => pkg.repository === 'recommended')
              .map((pkg) => (
                <ListItem key={pkg.name}>{pkg.name}</ListItem>
              ))}
          </List>
        </ExpandableSection>
      )}
      <Repositories />
    </Form>
  );
};

export default RepositoriesStep;
