import React, { useEffect, useMemo } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import KeyboardDropDown from './components/KeyboardDropDown';
import LanguagesDropDown from './components/LanguagesDropDown';
import { getRequiredLangpacksForLocales } from './langpacks';

import { useGetArchitecturesQuery } from '../../../../store/backendApi';
import { useSearchRpmMutation } from '../../../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { asDistribution } from '../../../../store/typeGuards';
import {
  selectArchitecture,
  selectDistribution,
  selectLanguages,
  selectLocaleLangpacks,
  setLocaleLangpacks,
} from '../../../../store/wizardSlice';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const LocaleStep = () => {
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const languages = useAppSelector(selectLanguages);
  const verifiedLangpacks = useAppSelector(selectLocaleLangpacks);
  const [searchRpms] = useSearchRpmMutation();
  const { data: distroRepositories } = useGetArchitecturesQuery({
    distribution: asDistribution(distribution),
  });

  const requiredLangpacks = useMemo(
    () => getRequiredLangpacksForLocales(languages ?? []),
    [languages],
  );

  const distroUrls = useMemo(() => {
    return (
      distroRepositories
        ?.find((archItem) => archItem.arch === arch)
        ?.repositories.filter((repo) => !!repo.baseurl)
        .map((repo) => repo.baseurl!) ?? []
    );
  }, [distroRepositories, arch]);

  // Verify which of the candidate langpacks (requiredLangpacks) actually exist
  // in repos; only those get stored and shown.
  useEffect(() => {
    if (requiredLangpacks.length === 0) {
      dispatch(setLocaleLangpacks([]));
      return;
    }

    if (!process.env.IS_ON_PREMISE && distroUrls.length === 0) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const data = await searchRpms({
          apiContentUnitSearchRequest: process.env.IS_ON_PREMISE
            ? {
                packages: requiredLangpacks,
                architecture: arch,
                distribution: asDistribution(distribution),
              }
            : {
                exact_names: requiredLangpacks,
                urls: distroUrls,
                limit: 500,
              },
        }).unwrap();

        const found = data.flatMap(({ package_name }) =>
          package_name ? [package_name] : [],
        );
        const verified = Array.from(new Set(found));
        if (!cancelled) {
          dispatch(setLocaleLangpacks(verified));
        }
      } catch {
        if (!cancelled) {
          dispatch(setLocaleLangpacks([]));
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [arch, distribution, distroUrls, dispatch, requiredLangpacks, searchRpms]);

  return (
    <Form>
      <CustomizationLabels customization='locale' />
      <Title headingLevel='h1' size='xl'>
        Locale
      </Title>
      <Content>Select the locale for your image.</Content>
      <LanguagesDropDown />
      {verifiedLangpacks.length > 0 && (
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
    </Form>
  );
};

export default LocaleStep;
