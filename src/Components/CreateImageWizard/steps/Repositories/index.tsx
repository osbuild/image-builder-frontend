import React from 'react';

import { Alert, Button, Form, Content, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import Repositories from './Repositories';

import { CONTENT_URL } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectPackages,
  selectRecommendedRepositories,
} from '../../../../store/wizardSlice';

const ManageRepositoriesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      iconPosition="right"
      isInline
      icon={<ExternalLinkAltIcon />}
      href={CONTENT_URL}
    >
      Create and manage repositories here
    </Button>
  );
};

const RepositoriesStep = () => {
  const packages = useAppSelector(selectPackages);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Custom repositories
      </Title>
      <Content component="p">
        Select the linked custom repositories from which you can add packages to
        the image.
        <br />
        <ManageRepositoriesButton />
      </Content>
      {packages.length && recommendedRepos.length ? (
        <Alert
          title="Why can't I remove a selected repository?"
          variant="info"
          isInline
        >
          EPEL repository cannot be removed, because packages from it were
          selected. If you wish to remove the repository, please remove
          following packages on the Packages step:{' '}
          {packages.map((pkg) => pkg.name).join(', ')}
        </Alert>
      ) : (
        ''
      )}
      <Repositories />
    </Form>
  );
};

export default RepositoriesStep;
