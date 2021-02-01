import React from 'react';
import PropTypes from 'prop-types';

import { Button, DualListSelector, Text, TextContent, Title } from '@patternfly/react-core';

const WizardStepPackages = (props) => {
    const availableOptionsActions = [
        <Button
            aria-label="Search button for available packages"
            key="availableSearchButton"
            onClick={ props.handlePackagesSearch }>
            Search
        </Button>
    ];

    return (
        <>
            <TextContent>
                <Title headingLevel="h2" size="xl">Additional packages</Title>
                <Text>Optionally add additional packages to your <strong>{props.release}</strong> image</Text>
            </TextContent>
            <DualListSelector
                className="pf-u-mt-sm"
                isSearchable
                availableOptionsActions={ availableOptionsActions }
                availableOptions={ props.packagesAvailableComponents }
                chosenOptions={ props.packagesFilteredComponents }
                addSelected={ props.packageListChange }
                removeSelected={ props.packageListChange }
                addAll={ props.packageListChange }
                removeAll= { props.packageListChange }
                onAvailableOptionsSearchInputChanged={ props.setPackagesSearchName }
                onChosenOptionsSearchInputChanged={ props.handlePackagesFilter }
                filterOption={ () => true }
                id="basicSelectorWithSearch" />
        </>
    );
};

WizardStepPackages.propTypes = {
    packageListChange: PropTypes.func,
    release: PropTypes.string,
    packagesAvailableComponents: PropTypes.arrayOf(PropTypes.object),
    packagesFilteredComponents: PropTypes.arrayOf(PropTypes.object),
    handlePackagesSearch: PropTypes.func,
    handlePackagesFilter: PropTypes.func,
    setPackagesSearchName: PropTypes.func,
};

export default WizardStepPackages;
