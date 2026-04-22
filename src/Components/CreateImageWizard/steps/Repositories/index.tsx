import React from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import {
  selectPackages,
  selectRecommendedRepositories,
  selectWizardMode,
} from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import ManageRepositoriesButton from './components/ManageRepositoriesButton';
import Repositories from './components/Repositories';

const RepositoriesStep = () => {
  const wizardMode = useAppSelector(selectWizardMode);
  const packages = useAppSelector(selectPackages);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);

  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;
  return (
    <Wrapper>
      <CustomizationLabels customization='repositories' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
        >
          Repositories
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
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
    </Wrapper>
  );
};

export default RepositoriesStep;
