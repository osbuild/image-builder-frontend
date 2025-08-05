import React from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';

import ManageRepositoriesButton from './components/ManageRepositoriesButton';
import Repositories from './Repositories';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectPackages,
  selectRecommendedRepositories,
} from '../../../../store/wizardSlice';

const RepositoriesStep = () => {
  const packages = useAppSelector(selectPackages);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Custom repositories
      </Title>
      <Content>
        Select the linked custom repositories from which you can add packages to
        the image
        <Content>
          <ManageRepositoriesButton />
        </Content>
      </Content>
      {packages.length && recommendedRepos.length ? (
        <Alert
          title="Why can't I remove a selected repository?"
          variant='info'
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
