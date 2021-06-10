import React, { useState, useRef, useEffect } from 'react';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import { DualListSelector, Button, TextContent } from '@patternfly/react-core';
import api from '../../../api';
import PropTypes from 'prop-types';
import '../WizardStepPackages.scss';

const mapPackagesToComponent = (packages) => packages.map((pack, key) => (
    <TextContent key={ `${pack.name}-${key}` }>
        <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
        <small>{ pack.summary }</small>
    </TextContent>
));

const mapComponentToPackage = (component) => ({
    name: component.props.children[0].props.children,
    summary: component.props.children[1].props.children
});

const Packages = ({ defaultArch, ...props }) => {
    const { change, getState } = useFormApi();
    const { input } = useFieldApi(props);
    const packagesSearchName = useRef();
    const [ packagesAvailable, setPackagesAvailable ] = useState([]);
    const [ packagesSelected, setPackagesSelected ] = useState([]);
    const [ filterSelected, setFilterSelected ] = useState('');

    useEffect(() => {
        setPackagesSelected(mapPackagesToComponent(getState()?.values?.[input.name] || []));
    }, []);

    const packageListChange = (newAvailablePackages, newChosenPackages) => {
        const chosenPkgs = newChosenPackages.map(mapComponentToPackage);
        setPackagesAvailable(newAvailablePackages);
        setPackagesSelected(newChosenPackages);
        change(input.name, chosenPkgs);
    };

    const handlePackagesSearch = async () => {
        const { data } = await api.getPackages(
            getState()?.values?.release,
            getState()?.values?.architecture || defaultArch,
            packagesSearchName.current
        );
        setPackagesAvailable(mapPackagesToComponent(data || []));
    };

    return <DualListSelector
        className="pf-u-mt-sm"
        isSearchable
        availableOptionsActions={ [
            <Button
                aria-label="Search button for available packages"
                key="availableSearchButton"
                data-testid="search-pkgs-button"
                onClick={ handlePackagesSearch }>
                Search
            </Button>
        ] }
        availableOptions={ packagesAvailable }
        availableOptionsTitle="Available packages"
        chosenOptions={ packagesSelected.filter((item) => mapComponentToPackage(item)?.name?.includes(filterSelected)) }
        chosenOptionsTitle="Chosen packages"
        addSelected={ packageListChange }
        removeSelected={ packageListChange }
        addAll={ packageListChange }
        removeAll= { (newAvailablePackages) => packageListChange(
            newAvailablePackages,
            packagesSelected.filter((item) => !mapComponentToPackage(item)?.name?.includes(filterSelected))
        ) }
        onAvailableOptionsSearchInputChanged={ (val) => {
            packagesSearchName.current = val;
        } }
        onChosenOptionsSearchInputChanged={ (val) => setFilterSelected(val) }
        filterOption={ () => true }
        id="basicSelectorWithSearch" />;
};

Packages.propTypes = {
    defaultArch: PropTypes.string,
};

export default Packages;
