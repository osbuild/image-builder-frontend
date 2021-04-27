import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, DualListSelector, Text, TextContent, Title } from '@patternfly/react-core';

import { actions } from '../../store/actions';
import api from '../../api.js';

class WizardStepPackages extends Component {
    constructor(props) {
        super(props);

        this.setPackagesSearchName = this.setPackagesSearchName.bind(this);
        this.handlePackagesSearch = this.handlePackagesSearch.bind(this);
        this.handlePackagesFilter = this.handlePackagesFilter.bind(this);
        this.packageListChange = this.packageListChange.bind(this);
        this.mapPackagesToComponent = this.mapPackagesToComponent.bind(this);

        const comps = this.mapPackagesToComponent(this.props.selectedPackages);
        this.state = {
            packagesAvailableComponents: [],
            packagesSelectedComponents: comps,
            packagesFilteredComponents: comps,
            packagesSearchName: '',
        };
    }

    setPackagesSearchName(packagesSearchName) {
        this.setState({ packagesSearchName });
    }

    mapPackagesToComponent(packages) {
        return packages.map((pack) =>
            <TextContent key={ pack }>
                <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
                <small>{ pack.summary }</small>
            </TextContent>
        );
    }

    // this digs into the component properties to extract the package
    mapComponentToPackage(component) {
        return { name: component.props.children[0].props.children, summary: component.props.children[1].props.children };
    }

    handlePackagesSearch() {
        api.getPackages(this.props.release.distro, this.props.release.arch, this.state.packagesSearchName).then(response => {
            const packageComponents = this.mapPackagesToComponent(response.data);
            this.setState({
                packagesAvailableComponents: packageComponents
            });
        });
    };

    handlePackagesFilter(filter) {
        const filteredPackages = this.state.packagesSelectedComponents.filter(component => {
            return this.mapComponentToPackage(component).name.includes(filter);
        });
        this.setState({
            packagesFilteredComponents: filteredPackages
        });
    }

    packageListChange(newAvailablePackages, newChosenPackages) {
        const chosenPkgs = newChosenPackages.map(component => this.mapComponentToPackage(component));
        this.setState({
            packagesAvailableComponents: newAvailablePackages,
            packagesSelectedComponents: newChosenPackages,
            packagesFilteredComponents: newChosenPackages,
        });

        this.props.setSelectedPackages(chosenPkgs);
    }

    render() {
        const availableOptionsActions = [
            <Button
                aria-label="Search button for available packages"
                key="availableSearchButton"
                data-testid="search-pkgs-button"
                onClick={ this.handlePackagesSearch }>
                Search
            </Button>
        ];
        return (
            <>
                <TextContent>
                    <Title headingLevel="h2" size="xl">Additional packages</Title>
                    <Text>Optionally add additional packages to your <strong>{this.props.release.distro}</strong> image</Text>
                </TextContent>
                <DualListSelector
                    className="pf-u-mt-sm"
                    isSearchable
                    availableOptionsActions={ availableOptionsActions }
                    availableOptions={ this.state.packagesAvailableComponents }
                    chosenOptions={ this.state.packagesFilteredComponents }
                    addSelected={ this.packageListChange }
                    removeSelected={ this.packageListChange }
                    addAll={ this.packageListChange }
                    removeAll= { this.packageListChange }
                    onAvailableOptionsSearchInputChanged={ this.setPackagesSearchName }
                    onChosenOptionsSearchInputChanged={ this.handlePackagesFilter }
                    filterOption={ () => true }
                    id="basicSelectorWithSearch" />
            </>
        );
    }
};

function mapStateToProps(state) {
    return {
        release: state.pendingCompose.release,
        selectedPackages: state.pendingCompose.selectedPackages,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSelectedPackages: (p) => dispatch(actions.setSelectedPackages(p)),
    };
}

WizardStepPackages.propTypes = {
    release: PropTypes.object,
    selectedPackages: PropTypes.array,
    setSelectedPackages: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardStepPackages);
