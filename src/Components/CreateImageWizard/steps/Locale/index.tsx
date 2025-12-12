import React, { useEffect, useMemo, useState } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import KeyboardDropDown from './components/KeyboardDropDown';
import LanguagesDropDown from './components/LanguagesDropDown';
import { getRequiredLangpacksForLocales } from './langpacks';

import { useGetArchitecturesQuery } from '../../../../store/backendApi';
import { useSearchRpmMutation } from '../../../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  addPackage,
  selectArchitecture,
  selectDistribution,
  selectLanguages,
  selectLocaleSuppressedLangpacks,
  selectPackages,
} from '../../../../store/wizardSlice';
import { getDistroRepoUrlsForArch } from '../../utilities/repositories';

const LocaleStep = () => {
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const languages = useAppSelector(selectLanguages);
  const packages = useAppSelector(selectPackages);
  const suppressed = useAppSelector(selectLocaleSuppressedLangpacks);
  const [searchRpms] = useSearchRpmMutation();
  const { data: distroRepositories } = useGetArchitecturesQuery({
    distribution,
  });
  // The langpacks that will be shown as "added because of the locale you selected" to the user
  const [verifiedLangpacks, setVerifiedLangpacks] = useState<string[]>([]);

  const requiredUnsuppressedLangpacks = useMemo(() => {
    const required = getRequiredLangpacksForLocales(languages ?? []);
    return required.filter((p) => !suppressed.includes(p));
  }, [languages, suppressed]);

  const distroRepoUrls = useMemo(() => {
    return getDistroRepoUrlsForArch(distroRepositories, arch);
  }, [distroRepositories, arch]);

  // Verify which required langpacks actually exist
  useEffect(() => {
    const required = requiredUnsuppressedLangpacks;
    const existingNames = new Set(packages.map((p) => p.name));
    const alreadySelected = required.filter((p) => existingNames.has(p));

    // If there are no locale-driven langpacks, show nothing and skip search
    if (required.length === 0) {
      setVerifiedLangpacks([]);
      return;
    }

    // Hosted: if URLs not ready yet, show only already-selected
    if (!process.env.IS_ON_PREMISE && distroRepoUrls.length === 0) {
      setVerifiedLangpacks(alreadySelected);
      return;
    }

    (async () => {
      try {
        const data = await searchRpms({
          apiContentUnitSearchRequest: process.env.IS_ON_PREMISE
            ? {
                packages: required,
                architecture: arch,
                distribution,
              }
            : {
                exact_names: required,
                urls: distroRepoUrls,
                limit: 500,
              },
        }).unwrap();

        const found = data.flatMap(({ package_name }) =>
          package_name ? [package_name] : [],
        );
        const merged = Array.from(new Set([...alreadySelected, ...found]));
        setVerifiedLangpacks(merged);
      } catch {
        setVerifiedLangpacks(alreadySelected);
      }
    })();
  }, [
    arch,
    distribution,
    distroRepoUrls,
    searchRpms,
    packages,
    requiredUnsuppressedLangpacks,
  ]);

  // Auto-install only verified langpacks that are still required and not already present
  useEffect(() => {
    const existing = new Set(packages.map((p) => p.name));
    for (const pkg of verifiedLangpacks) {
      if (!existing.has(pkg) && requiredUnsuppressedLangpacks.includes(pkg)) {
        dispatch(
          addPackage({
            name: pkg,
            summary: 'Language support for selected locales',
            repository: 'distro',
          }),
        );
      }
    }
  }, [dispatch, packages, verifiedLangpacks, requiredUnsuppressedLangpacks]);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Locale
      </Title>
      <Content>
        Select the locale for your image. If a chosen locale is not available by
        default, the corresponding language pack will be added automatically.
      </Content>
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
