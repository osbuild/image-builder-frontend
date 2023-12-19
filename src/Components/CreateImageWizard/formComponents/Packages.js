import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import {
  Alert,
  Divider,
  DualListSelector,
  DualListSelectorControl,
  DualListSelectorControlsWrapper,
  DualListSelectorList,
  DualListSelectorListItem,
  DualListSelectorPane,
  SearchInput,
  TextContent,
} from '@patternfly/react-core';
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  AngleLeftIcon,
  AngleRightIcon,
} from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import api from '../../../api';
import {
  useGetArchitecturesQuery,
  useGetOscapCustomizationsQuery,
} from '../../../store/imageBuilderApi';

const ExactMatch = ({
  pkgList,
  search,
  chosenPackages,
  selectedAvailablePackages,
  handleSelectAvailableFunc,
}) => {
  const match = pkgList.find((pkg) => pkg.name === search);
  return (
    <DualListSelectorListItem
      data-testid={`exact-match-${match.name}`}
      isDisabled={chosenPackages[match.name] ? true : false}
      isSelected={selectedAvailablePackages.has(match.name)}
      onOptionSelect={(e) => handleSelectAvailableFunc(e, match.name)}
    >
      <TextContent key={`${match.name}`}>
        <small className="pf-u-mb-sm">Exact match</small>
        <span className="pf-c-dual-list-selector__item-text">{match.name}</span>
        <small>{match.summary}</small>
        <Divider />
      </TextContent>
    </DualListSelectorListItem>
  );
};

export const RedHatPackages = ({ defaultArch }) => {
  const { getState } = useFormApi();
  const distribution = getState()?.values?.release;
  const arch = getState()?.values?.arch;
  const { data: distributionInformation, isSuccess: isSuccessDistroInfo } =
    useGetArchitecturesQuery({ distribution });

  const getAllPackages = async (packagesSearchName) => {
    // if the env is stage beta then use content-sources api
    // else use image-builder api
    if (getState()?.values?.contentSourcesEnabled) {
      const filteredByArch = distributionInformation.find(
        (info) => info.arch === arch
      );
      const repoUrls = filteredByArch.repositories.map((repo) => repo.baseurl);
      return await api.getPackagesContentSources(repoUrls, packagesSearchName);
    } else {
      const args = [
        getState()?.values?.release,
        getState()?.values?.architecture || defaultArch,
        packagesSearchName,
      ];
      const response = await api.getPackages(...args);
      let { data } = response;
      const { meta } = response;
      if (data?.length === meta.count) {
        return data;
      } else if (data) {
        ({ data } = await api.getPackages(...args, meta.count));
        return data;
      }
    }
  };

  return (
    <Packages getAllPackages={getAllPackages} isSuccess={isSuccessDistroInfo} />
  );
};

export const ContentSourcesPackages = () => {
  const { getState } = useFormApi();

  const getAllPackages = async (packagesSearchName) => {
    const repos = getState()?.values?.['payload-repositories'];
    const repoUrls = repos?.map((repo) => repo.baseurl);
    return await api.getPackagesContentSources(repoUrls, packagesSearchName);
  };

  return <Packages getAllPackages={getAllPackages} />;
};

const Packages = ({ getAllPackages, isSuccess }) => {
  const { currentStep } = useContext(WizardContext);
  const { change, getState } = useFormApi();
  const [packagesSearchName, setPackagesSearchName] = useState(undefined);
  const [filterChosen, setFilterChosen] = useState('');
  const [chosenPackages, setChosenPackages] = useState({});
  const [focus, setFocus] = useState('');
  const selectedPackages = getState()?.values?.['selected-packages'];
  const [availablePackages, setAvailablePackages] = useState(undefined);
  const [selectedAvailablePackages, setSelectedAvailablePackages] = useState(
    new Set()
  );
  const [selectedChosenPackages, setSelectedChosenPackages] = useState(
    new Set()
  );
  const firstInputElement = useRef(null);

  const oscapProfile = getState()?.values?.['oscap-profile'];

  const { data: customizations, isSuccess: isSuccessCustomizations } =
    useGetOscapCustomizationsQuery(
      {
        distribution: getState()?.values?.['release'],
        profile: oscapProfile,
      },
      {
        skip: !oscapProfile,
      }
    );
  useEffect(() => {
    if (customizations && customizations.packages && isSuccessCustomizations) {
      const oscapPackages = {};
      for (const pkg of customizations.packages) {
        oscapPackages[pkg] = { name: pkg };
      }
      updateState(oscapPackages);
    }
  }, [customizations, isSuccessCustomizations, updateState]);

  // this effect only triggers on mount
  useEffect(() => {
    if (selectedPackages) {
      const newChosenPackages = {};
      for (const pkg of selectedPackages) {
        newChosenPackages[pkg.name] = pkg;
      }
      setChosenPackages(newChosenPackages);
    }
  }, []);

  useEffect(() => {
    if (isSuccess) {
      firstInputElement.current?.focus();
    }
  }, [isSuccess]);

  const searchResultsComparator = useCallback((searchTerm) => {
    return (a, b) => {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();

      // check exact match first
      if (a === searchTerm) {
        return -1;
      }

      if (b === searchTerm) {
        return 1;
      }

      // check for packages that start with the search term
      if (a.startsWith(searchTerm) && !b.startsWith(searchTerm)) {
        return -1;
      }

      if (b.startsWith(searchTerm) && !a.startsWith(searchTerm)) {
        return 1;
      }

      // if both (or neither) start with the search term
      // sort alphabetically
      if (a < b) {
        return -1;
      }

      if (b < a) {
        return 1;
      }

      return 0;
    };
  }, []);

  const availablePackagesDisplayList = useMemo(() => {
    if (availablePackages === undefined) {
      return [];
    }
    const availablePackagesList = Object.values(availablePackages).sort(
      searchResultsComparator(packagesSearchName)
    );
    return availablePackagesList;
  }, [availablePackages, packagesSearchName, searchResultsComparator]);

  const chosenPackagesDisplayList = useMemo(() => {
    const chosenPackagesList = Object.values(chosenPackages)
      .filter((pkg) => (pkg.name.includes(filterChosen) ? true : false))
      .sort(searchResultsComparator(filterChosen));
    return chosenPackagesList;
  }, [chosenPackages, filterChosen, searchResultsComparator]);

  // call api to list available packages
  const handleAvailablePackagesSearch = async () => {
    const packageList = await getAllPackages(packagesSearchName);
    // If no packages are found, Image Builder returns null, while
    // Content Sources returns an empty array [].
    if (packageList) {
      const newAvailablePackages = {};
      for (const pkg of packageList) {
        newAvailablePackages[pkg.name] = pkg;
      }
      setAvailablePackages(newAvailablePackages);
    } else {
      setAvailablePackages([]);
    }
  };

  const keydownHandler = (event) => {
    if (event.key === 'Enter') {
      if (focus === 'available') {
        event.stopPropagation();
        handleAvailablePackagesSearch();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', keydownHandler, true);

    return () => {
      document.removeEventListener('keydown', keydownHandler, true);
    };
  }, []);

  const updateState = useCallback(
    (newChosenPackages) => {
      setSelectedAvailablePackages(new Set());
      setSelectedChosenPackages(new Set());
      setChosenPackages(newChosenPackages);
      change('selected-packages', Object.values(newChosenPackages));
    },
    [change]
  );

  const moveSelectedToChosen = () => {
    const newChosenPackages = { ...chosenPackages };
    for (const pkgName of selectedAvailablePackages) {
      newChosenPackages[pkgName] = { ...availablePackages[pkgName] };
    }
    updateState(newChosenPackages);
  };

  const moveAllToChosen = () => {
    const newChosenPackages = { ...chosenPackages, ...availablePackages };
    updateState(newChosenPackages);
  };

  const removeSelectedFromChosen = () => {
    const newChosenPackages = {};
    for (const pkgName in chosenPackages) {
      if (!selectedChosenPackages.has(pkgName)) {
        newChosenPackages[pkgName] = { ...chosenPackages[pkgName] };
      }
    }
    updateState(newChosenPackages);
  };

  const removeAllFromChosen = () => {
    const newChosenPackages = {};
    updateState(newChosenPackages);
  };

  const handleSelectAvailable = (event, pkgName) => {
    const newSelected = new Set(selectedAvailablePackages);
    newSelected.has(pkgName)
      ? newSelected.delete(pkgName)
      : newSelected.add(pkgName);
    setSelectedAvailablePackages(newSelected);
  };

  const handleSelectChosen = (event, pkgName) => {
    const newSelected = new Set(selectedChosenPackages);
    newSelected.has(pkgName)
      ? newSelected.delete(pkgName)
      : newSelected.add(pkgName);
    setSelectedChosenPackages(newSelected);
  };

  const handleClearAvailableSearch = () => {
    setPackagesSearchName('');
    setAvailablePackages(undefined);
  };

  const handleClearChosenSearch = () => {
    setFilterChosen('');
  };

  return (
    <DualListSelector>
      <DualListSelectorPane
        title="Available packages"
        searchInput={
          <>
            <SearchInput
              placeholder="Search for a package"
              data-testid="search-available-pkgs-input"
              value={packagesSearchName}
              ref={firstInputElement}
              onFocus={() => setFocus('available')}
              onBlur={() => setFocus('')}
              onChange={(_, val) => setPackagesSearchName(val)}
              submitSearchButtonLabel="Search button for available packages"
              onSearch={handleAvailablePackagesSearch}
              resetButtonLabel="Clear available packages search"
              onClear={handleClearAvailableSearch}
              isDisabled={currentStep.name === 'packages' ? !isSuccess : false}
            />
            {availablePackagesDisplayList.length >= 100 && (
              <Alert
                title="Over 100 results found. Refine your search."
                variant="warning"
                isPlain
                isInline
              />
            )}
          </>
        }
        status={
          selectedAvailablePackages.size > 0
            ? `${selectedAvailablePackages.size}
          of ${availablePackagesDisplayList.length} items`
            : `${availablePackagesDisplayList.length} items`
        }
      >
        <DualListSelectorList data-testid="available-pkgs-list">
          {availablePackages === undefined ? (
            <p className="pf-u-text-align-center pf-u-mt-md">
              Search above to add additional
              <br />
              packages to your image
            </p>
          ) : availablePackagesDisplayList.length === 0 ? (
            <>
              <p className="pf-u-text-align-center pf-u-mt-md pf-u-font-size-lg pf-u-font-weight-bold">
                No results found
              </p>
              <br />
              <p className="pf-u-text-align-center pf-u-mt-md">
                Adjust your search and try again
              </p>
            </>
          ) : availablePackagesDisplayList.length >= 100 ? (
            <>
              {availablePackagesDisplayList.some(
                (pkg) => pkg.name === packagesSearchName
              ) && (
                <ExactMatch
                  pkgList={availablePackagesDisplayList}
                  search={packagesSearchName}
                  chosenPackages={chosenPackages}
                  selectedAvailablePackages={selectedAvailablePackages}
                  handleSelectAvailableFunc={handleSelectAvailable}
                />
              )}
              <p className="pf-u-text-align-center pf-u-mt-md pf-u-font-size-lg pf-u-font-weight-bold">
                Too many results to display
              </p>
              <br />
              <p className="pf-u-text-align-center pf-u-mt-md">
                Please make the search more specific
                <br />
                and try again
              </p>
            </>
          ) : (
            availablePackagesDisplayList.map((pkg) => {
              return (
                <DualListSelectorListItem
                  data-testid={`available-pkgs-${pkg.name}`}
                  key={pkg.name}
                  isDisabled={chosenPackages[pkg.name] ? true : false}
                  isSelected={selectedAvailablePackages.has(pkg.name)}
                  onOptionSelect={(e) => handleSelectAvailable(e, pkg.name)}
                >
                  <TextContent key={`${pkg.name}`}>
                    <span
                      className={
                        chosenPackages[pkg.name] && 'pf-v5-u-color-400'
                      }
                    >
                      {pkg.name}
                    </span>
                    <small>{pkg.summary}</small>
                  </TextContent>
                </DualListSelectorListItem>
              );
            })
          )}
        </DualListSelectorList>
      </DualListSelectorPane>
      <DualListSelectorControlsWrapper aria-label="Selector controls">
        <DualListSelectorControl
          isDisabled={selectedAvailablePackages.size === 0}
          onClick={() => moveSelectedToChosen()}
          aria-label="Add selected"
          tooltipContent="Add selected"
        >
          <AngleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          isDisabled={
            availablePackagesDisplayList.length === 0 ||
            // also disable the "Add all" button if there are too many matches
            // (even if there's an exact match)
            availablePackagesDisplayList.length >= 100
          }
          onClick={() => moveAllToChosen()}
          aria-label="Add all"
          tooltipContent="Add all"
        >
          <AngleDoubleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          isDisabled={Object.values(chosenPackages).length === 0}
          onClick={() => removeAllFromChosen()}
          aria-label="Remove all"
          tooltipContent="Remove all"
        >
          <AngleDoubleLeftIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          onClick={() => removeSelectedFromChosen()}
          isDisabled={selectedChosenPackages.size === 0}
          aria-label="Remove selected"
          tooltipContent="Remove selected"
        >
          <AngleLeftIcon />
        </DualListSelectorControl>
      </DualListSelectorControlsWrapper>
      <DualListSelectorPane
        title="Chosen packages"
        searchInput={
          <SearchInput
            placeholder="Search for a package"
            data-testid="search-chosen-pkgs-input"
            value={filterChosen}
            onFocus={() => setFocus('chosen')}
            onBlur={() => setFocus('')}
            onChange={(_, val) => setFilterChosen(val)}
            resetButtonLabel="Clear chosen packages search"
            onClear={handleClearChosenSearch}
          />
        }
        status={
          selectedChosenPackages.size > 0
            ? `${selectedChosenPackages.size}
          of ${chosenPackagesDisplayList.length} items`
            : `${chosenPackagesDisplayList.length} items`
        }
        isChosen
      >
        <DualListSelectorList data-testid="chosen-pkgs-list">
          {Object.values(chosenPackages).length === 0 ? (
            <p className="pf-u-text-align-center pf-u-mt-md">
              No packages added
            </p>
          ) : chosenPackagesDisplayList.length === 0 ? (
            <p className="pf-u-text-align-center pf-u-mt-md">
              No packages found
            </p>
          ) : (
            chosenPackagesDisplayList.map((pkg) => {
              return (
                <DualListSelectorListItem
                  data-testid={`selected-pkgs-${pkg.name}`}
                  key={pkg.name}
                  isSelected={selectedChosenPackages.has(pkg.name)}
                  onOptionSelect={(e) => handleSelectChosen(e, pkg.name)}
                >
                  <TextContent key={`${pkg.name}`}>
                    <span className="pf-c-dual-list-selector__item-text">
                      {pkg.name}
                    </span>
                    <small>{pkg.summary}</small>
                  </TextContent>
                </DualListSelectorListItem>
              );
            })
          )}
        </DualListSelectorList>
      </DualListSelectorPane>
    </DualListSelector>
  );
};

ExactMatch.propTypes = {
  pkgList: PropTypes.arrayOf(PropTypes.object),
  search: PropTypes.string,
  chosenPackages: PropTypes.object,
  selectedAvailablePackages: PropTypes.object,
  handleSelectAvailableFunc: PropTypes.func,
};

RedHatPackages.propTypes = {
  defaultArch: PropTypes.string,
};

Packages.propTypes = {
  getAllPackages: PropTypes.func,
  isSuccess: PropTypes.bool,
};
