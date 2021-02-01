import React from 'react';
import PropTypes from 'prop-types';

import {
    Button, ButtonVariant,
    DataList, DataListAction, DataListCell, DataListItem, DataListItemRow, DataListItemCells,
    InputGroup,
    Pagination,
    Text, TextContent, TextInput,
    Title,
    Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { ExternalLinkAltIcon, MinusCircleIcon, PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';

const WizardStepPackages = (props) => {
    return (
        <>
            <TextContent>
                <Title headingLevel="h2" size="xl">Additional packages</Title>
                <Text>Add additional packages to your <strong>{props.release}</strong> image</Text>
                <Button
                    component="a"
                    target="_blank"
                    variant="link"
                    icon={ <ExternalLinkAltIcon /> }
                    iconPosition="right"
                    isInline
                    href="https://redhat.com">
                    View packages in base image
                </Button>
            </TextContent>
            <Toolbar id="packages-toolbar">
                <ToolbarContent>
                    <ToolbarItem>
                        <InputGroup>
                            <TextInput
                                id="packages-input"
                                type="search"
                                aria-label="search packages input"
                                placeholder="Search for a package"
                                value={ props.packagesSearchName }
                                onChange={ props.setPackagesSearchName } />
                            <Button
                                variant={ ButtonVariant.control }
                                aria-label="search icon for search packages input"
                                onClick={ props.handlePackagesSearch }>
                                <SearchIcon />
                            </Button>
                        </InputGroup>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Button
                            variant="primary"
                            aria-label="search button for search packages input"
                            onClick={ props.handlePackagesSearch }>
                                Search
                        </Button>
                    </ToolbarItem>
                    {props.showPackagesSearch &&
                        <>
                            <ToolbarItem>
                                <Button
                                    component="a"
                                    variant="link"
                                    isInline
                                    type="submit"
                                    onClick={ props.clearPackagesSearch }>
                                Clear search
                                </Button>
                            </ToolbarItem>
                            <ToolbarItem variant="pagination" align={ { default: 'alignRight' } }>
                                <Pagination
                                    itemCount={ 523 }
                                    perPage={ props.packagesSearchPerPage }
                                    page={ props.packagesSearchPage }
                                    onSetPage={ props.setPagePackagesSearch }
                                    onPerPageSelect={ props.setPerPagePackagesSearch }
                                    widgetId="pagination-options-package-search"
                                    isCompact />
                            </ToolbarItem>
                        </>
                    }
                </ToolbarContent>
            </Toolbar>
            {props.showPackagesSearch && (
                <DataList aria-label="packages data list" isCompact>
                    {props.packages.map((pack) =>
                        <DataListItem key={ pack.name } aria-labelledby={ pack.name }>
                            <DataListItemRow>
                                <DataListItemCells
                                    dataListCells={ [
                                        <DataListCell key="package-details" id="select package details">
                                            <TextContent>
                                                <span>{ pack.name }</span>
                                                <small>{ pack.summary }</small>
                                            </TextContent>
                                        </DataListCell>
                                    ] } />
                                <DataListAction
                                    key="package-action"
                                    aria-label="select package action"
                                    aria-labelledby="select package details">
                                    { pack.selected ? (
                                        <Button variant="link" icon={ <MinusCircleIcon /> } onClick={ () => props.handleRemovePackage(pack) }>
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button variant="link" icon={ <PlusCircleIcon /> } onClick={ () => props.handleAddPackage(pack) }>
                                            Add
                                        </Button>
                                    )}
                                </DataListAction>
                            </DataListItemRow>
                        </DataListItem>
                    )}
                </DataList>
            )}
            <Toolbar id="selected-packages-toolbar">
                <ToolbarContent>
                    <ToolbarItem>
                        <Title headingLevel="h3">Additional packages</Title>
                    </ToolbarItem>
                    {props.selectedPackages.length > 0 && (
                        <ToolbarItem variant="pagination" align={ { default: 'alignRight' } }>
                            <Pagination
                                itemCount={ 523 }
                                perPage={ props.packagesSelectedPerPage }
                                page={ props.packagesSelectedPage }
                                onSetPage={ props.setPagePackagesSelected }
                                onPerPageSelect={ props.setPerPagePackagesSelected }
                                widgetId="pagination-options-packages-selected"
                                isCompact />
                        </ToolbarItem>
                    )}
                </ToolbarContent>
            </Toolbar>
            {props.selectedPackages.length > 0 ? (
                <DataList aria-label="selected packages data list" isCompact>
                    {props.selectedPackages.map((pack) =>
                        <DataListItem key={ pack.name } aria-labelledby={ pack.name }>
                            <DataListItemRow>
                                <DataListItemCells
                                    dataListCells={ [
                                        <DataListCell key="selected-package-details" id="selected package details">
                                            <TextContent>
                                                <span>{ pack.name }</span>
                                                <small>{ pack.summary }</small>
                                            </TextContent>
                                        </DataListCell>
                                    ] } />
                                <DataListAction
                                    key="selected-package-action"
                                    aria-label="select package action"
                                    aria-labelledby="selected package details">
                                    <Button variant="link" icon={ <MinusCircleIcon /> } onClick={ () => props.handleRemovePackage(pack) }>
                                        Remove
                                    </Button>
                                </DataListAction>
                            </DataListItemRow>
                        </DataListItem>
                    )}
                </DataList>
            ) : (
                <TextContent>
                    <Text>No additional packages added.</Text>
                    <Text>Search above to add additional packages to your image.</Text>
                </TextContent>
            )}
        </>
    );
};

WizardStepPackages.propTypes = {
    release: PropTypes.string,
    packages: PropTypes.arrayOf(PropTypes.object),
    selectedPackages: PropTypes.arrayOf(PropTypes.object),
    showPackagesSearch: PropTypes.bool,
    packagesSearchName: PropTypes.string,
    packagesSearchPage: PropTypes.number,
    packagesSearchPerPage: PropTypes.number,
    packagesSelectedPage: PropTypes.number,
    packagesSelectedPerPage: PropTypes.number,
    clearPackagesSearch: PropTypes.func,
    handlePackagesSearch: PropTypes.func,
    handleAddPackage: PropTypes.func,
    handleRemovePackage: PropTypes.func,
    setPackagesSearchName: PropTypes.func,
    setPagePackagesSearch: PropTypes.func,
    setPerPagePackagesSearch: PropTypes.func,
    setPagePackagesSelected: PropTypes.func,
    setPerPagePackagesSelected: PropTypes.func,
};

export default WizardStepPackages;
