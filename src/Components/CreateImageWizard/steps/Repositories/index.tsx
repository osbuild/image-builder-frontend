import React from 'react';

import { Alert, Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import {
  selectPackages,
  selectRecommendedRepositories,
  selectWizardMode,
} from '@/store/slices/wizard';

import ManageRepositoriesButton from './components/ManageRepositoriesButton';
import Repositories from './components/Repositories';

const RepositoriesStep = () => {
  const wizardMode = useAppSelector(selectWizardMode);
  const packages = useAppSelector(selectPackages);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);

  return (
    <>
      <CustomizationLabels customization='repositories' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Repositories
        </Title>
        <Content component='small'>
          Can&apos;t find a repository? Ensure it&apos;s been added on{' '}
          <ManageRepositoriesButton
            label={'the Repositories page'}
            icon={true}
          />
        </Content>
      </Content>
      {wizardMode === 'edit' && (
        <Alert
          title='Removing previously added repositories may lead to issues with selected packages'
          variant='warning'
          isInline
        />
      )}
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
    </>
  );
};

export default RepositoriesStep;
