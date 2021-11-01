import React, { useState, useRef,  } from 'react';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import api from '../../../api';
import PropTypes from 'prop-types';
import {
    Button,
    DualListSelector,
    DualListSelectorPane,
    DualListSelectorList,
    DualListSelectorListItem,
    DualListSelectorControlsWrapper,
    DualListSelectorControl,
    SearchInput,
    TextContent
} from '@patternfly/react-core';
import { AngleDoubleLeftIcon, AngleLeftIcon, AngleDoubleRightIcon, AngleRightIcon } from '@patternfly/react-icons';

// the fields isHidden and isSelected should not be included in the package list sent for image creation
const removePackagesDisplayFields = (packages) => packages.map((pack) => ({
    name: pack.name,
    summary: pack.summary,
}));

const Packages = ({ defaultArch, ...props }) => {
    const { change, getState } = useFormApi();
    const { input } = useFieldApi(props);
    const packagesSearchName = useRef();
    const [ packagesAvailable, setPackagesAvailable ] = useState([]);
    const [ packagesChosen, setPackagesChosen ] = useState([]);
    const [ filterChosen, setFilterChosen ] = useState('');

    // call api to list available packages
    const handlePackagesAvailableSearch = async () => {
        const { data } = await api.getPackages(
            getState()?.values?.release,
            getState()?.values?.architecture || defaultArch,
            packagesSearchName.current
        );
        setPackagesAvailable(data);
    };

    // filter displayed selected packages
    const handlePackagesChosenSearch = () => {
        const filteredPackagesChosen = packagesChosen.map((pack) => {
            if (!pack.name.includes(filterChosen)) {
                pack.isHidden = true;
            } else {
                pack.isHidden = false;
            }

            return pack;
        });
        setPackagesChosen(filteredPackagesChosen);
    };

    // move selected packages
    const moveSelected = (fromAvailable) => {
        const sourcePackages = fromAvailable ? packagesAvailable : packagesChosen;
        const destinationPackages = fromAvailable ? packagesChosen : packagesAvailable;

        const updatedSourcePackages = sourcePackages.filter((pack) => {
            if (pack.selected) {
                pack.selected = false;
                destinationPackages.push(pack);
                return false;
            }

            return true;
        });

        if (fromAvailable) {
            setPackagesAvailable(updatedSourcePackages);
            setPackagesChosen([ ...destinationPackages ]);
        } else {
            setPackagesChosen(updatedSourcePackages);
            setPackagesAvailable([ ...destinationPackages ]);
        }

        // set the steps field to the current chosen packages list
        change(input.name, removePackagesDisplayFields(packagesChosen));
    };

    // move all packages
    const moveAll = (fromAvailable) => {
        if (fromAvailable) {
            setPackagesChosen([ ...packagesAvailable.filter(pack => !pack.isHidden), ...packagesChosen ]);
            setPackagesAvailable([ ...packagesAvailable.filter(pack => pack.isHidden) ]);
        } else {
            setPackagesAvailable([ ...packagesChosen.filter(pack => !pack.isHidden), ...packagesAvailable ]);
            setPackagesChosen([ ...packagesChosen.filter(pack => pack.isHidden) ]);
        }

        // set the steps field to the current chosen packages list
        change(input.name, removePackagesDisplayFields(packagesChosen));
    };

    const onOptionSelect = (event, index, isChosen) => {
        if (isChosen) {
            const newChosen = [ ...packagesChosen ];
            newChosen[index].selected = !packagesChosen[index].selected;
            setPackagesChosen(newChosen);
        } else {
            const newAvailable = [ ...packagesAvailable ];
            newAvailable[index].selected = !packagesAvailable[index].selected;
            setPackagesAvailable(newAvailable);
        }
    };

    return (
        <DualListSelector>
            <DualListSelectorPane
                title="Available packages"
                searchInput={ <SearchInput
                    placeholder="Search for a package"
                    data-testid="search-available-pkgs-input"
                    value={ packagesSearchName.current }
                    onChange={ (val) => {
                        packagesSearchName.current = val;
                    } } /> }
                actions={ [
                    <Button
                        aria-label="Search button for available packages"
                        key="availableSearchButton"
                        data-testid="search-available-pkgs-button"
                        onClick={ handlePackagesAvailableSearch }>
                        Search
                    </Button>
                ] }>
                <DualListSelectorList>
                    {packagesAvailable.map((pack, index) => {
                        return !pack.isHidden ? (
                            <DualListSelectorListItem
                                key={ index }
                                isSelected={ pack.selected }
                                onOptionSelect={ (e) => onOptionSelect(e, index, false) }>
                                <TextContent key={ `${pack.name}-${index}` }>
                                    <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
                                    <small>{ pack.summary }</small>
                                </TextContent>
                            </DualListSelectorListItem>
                        ) : null;
                    })}
                </DualListSelectorList>
            </DualListSelectorPane>
            <DualListSelectorControlsWrapper
                aria-label="Selector controls">
                <DualListSelectorControl
                    isDisabled={ !packagesAvailable.some(option => option.selected) }
                    onClick={ () => moveSelected(true) }
                    aria-label="Add selected"
                    tooltipContent="Add selected">
                    <AngleRightIcon />
                </DualListSelectorControl>
                <DualListSelectorControl
                    isDisabled={ packagesAvailable.length === 0 }
                    onClick={ () => moveAll(true) }
                    aria-label="Add all"
                    tooltipContent="Add all">
                    <AngleDoubleRightIcon />
                </DualListSelectorControl>
                <DualListSelectorControl
                    isDisabled={ packagesChosen.length === 0 }
                    onClick={ () => moveAll(false) }
                    aria-label="Remove all"
                    tooltipContent="Remove all">
                    <AngleDoubleLeftIcon />
                </DualListSelectorControl>
                <DualListSelectorControl
                    onClick={ () => moveSelected(false) }
                    isDisabled={ !packagesChosen.some(option => option.selected) }
                    aria-label="Remove selected"
                    tooltipContent="Remove selected">
                    <AngleLeftIcon />
                </DualListSelectorControl>
            </DualListSelectorControlsWrapper>
            <DualListSelectorPane
                title="Chosen packages"
                searchInput={ <SearchInput
                    placeholder="Search for a package"
                    value={ filterChosen }
                    onChange={ (val) => setFilterChosen(val) } /> }
                actions={ [
                    <Button
                        aria-label="Search button for selected packages"
                        key="selectedSearchButton"
                        data-testid="search-selected-pkgs-button"
                        onClick={ handlePackagesChosenSearch }>
                        Search
                    </Button>
                ] }
                isChosen>
                <DualListSelectorList>
                    {packagesChosen.map((pack, index) => {
                        return !pack.isHidden ? (
                            <DualListSelectorListItem
                                key={ index }
                                isSelected={ pack.selected }
                                onOptionSelect={ (e) => onOptionSelect(e, index, true) }>
                                <TextContent key={ `${pack.name}-${index}` }>
                                    <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
                                    <small>{ pack.summary }</small>
                                </TextContent>
                            </DualListSelectorListItem>
                        ) : null;
                    })}
                </DualListSelectorList>
            </DualListSelectorPane>
        </DualListSelector>
    );
};

Packages.propTypes = {
    defaultArch: PropTypes.string,
};

export default Packages;
