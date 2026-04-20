import React, { useMemo } from 'react';

import { Content, Form, Spinner, Title } from '@patternfly/react-core';

import { useGetArchitecturesQuery } from '@/store/api/backend';
import { useSearchLanguagePacks } from '@/store/api/distributions';
import {
  selectArchitecture,
  selectDistribution,
  selectLocaleLangpackCandidates,
  selectVerifiedLocaleLangpacks,
} from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import KeyboardDropDown from './components/KeyboardDropDown';
import LanguagesDropDown from './components/LanguagesDropDown';

import { useAppSelector } from '../../../../store/hooks';
import { asDistribution } from '../../../../store/typeGuards';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const LocaleStep = () => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const candidateLangpacks = useAppSelector(selectLocaleLangpackCandidates);
  const { data: distroRepositories, isLoading: isArchitecturesLoading } =
    useGetArchitecturesQuery({
      distribution: asDistribution(distribution),
    });

  const distroUrls = useMemo(() => {
    return (
      distroRepositories
        ?.find((archItem) => archItem.arch === arch)
        ?.repositories.filter((repo) => !!repo.baseurl)
        .map((repo) => repo.baseurl!) ?? []
    );
  }, [distroRepositories, arch]);

  const { isLoading: isSearchLoading } = useSearchLanguagePacks(distroUrls);
  const verifiedLangpacks = useAppSelector(selectVerifiedLocaleLangpacks);

  const isLoading =
    candidateLangpacks.length > 0 &&
    (isArchitecturesLoading || isSearchLoading);

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='locale' />
      <Title
        headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
        size={isWizardRevampEnabled ? 'lg' : 'xl'}
      >
        Locale
      </Title>
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
        Define the primary languages and keyboard settings for your image to
        ensure proper system localization and user interface support.
      </Content>
      <LanguagesDropDown />
      {isLoading && (
        <Content>
          <Spinner size='md' /> Resolving packages for your preferred locale…
        </Content>
      )}
      {!isLoading && verifiedLangpacks.length > 0 && (
        <Content>
          The following packages will be added based on your preferred locale:{' '}
          {verifiedLangpacks.map((pkg, idx) => (
            <strong key={pkg}>
              {pkg}
              {idx < verifiedLangpacks.length - 1 ? ', ' : ''}
            </strong>
          ))}
          .
        </Content>
      )}
      <KeyboardDropDown />
    </Wrapper>
  );
};

export default LocaleStep;
