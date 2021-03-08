import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../redux';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, classNames, Visibility } from '@patternfly/react-table';
import { TableToolbar } from '@redhat-cloud-services/frontend-components';
import { ToolbarGroup, ToolbarItem, EmptyState, EmptyStateVariant, EmptyStateIcon, EmptyStateBody, Title } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import ImageBuildStatus from '../../PresentationalComponents/ImagesTable/ImageBuildStatus';
import Release from '../../PresentationalComponents/ImagesTable/Release';
import Upload from '../../PresentationalComponents/ImagesTable/Upload';

import api from '../../api.js';

class ImagesTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    title: 'Image'
                },
                'Target',
                'Release',
                'Status',
                {
                    title: '',
                    props: { className: 'pf-u-text-align-right' },
                    columnTransforms: [
                        classNames(
                            Visibility.hiddenOnXs,
                            Visibility.hiddenOnSm,
                            Visibility.hiddenOnMd,
                            Visibility.visibleOnLg
                        )
                    ]
                }
            ]
        };
        this.pollComposeStatuses = this.pollComposeStatuses.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => this.pollComposeStatuses(), 8000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    pollComposeStatuses() {
        let { updateCompose, composes } = this.props;
        Object.entries(composes).map(([ id, compose ]) => {
            /* Skip composes that have been complete */
            if (compose.image_status.status === 'success' || compose.image_status.status === 'failure') {
                return;
            }

            api.getComposeStatus(id).then(response => {
                let newCompose = {};
                newCompose[id] = Object.assign({}, compose, { image_status: response.image_status });
                updateCompose(newCompose);
            });
        });
    }

    render() {
        let { composes } = this.props;
        const rows = Object.entries(composes).map(([ id, compose ]) => {
            return {
                cells: [
                    id,
                    { title: <Upload uploadType={ compose.upload_type } /> },
                    { title: <Release release={ compose.distribution } /> },
                    { title: <ImageBuildStatus status={ compose.image_status.status } /> },
                    ''
                ]
            };
        });
        return (
            <React.Fragment>
                { Object.keys(composes).length === 0 && (
                    <EmptyState variant={ EmptyStateVariant.large } data-testid="empty-state">
                        <EmptyStateIcon icon={ PlusCircleIcon } />
                        <Title headingLevel="h4" size="lg">
                            Create an image
                        </Title>
                        <EmptyStateBody>
                            Create OS images for deployment in Amazon Web Services, Azure and
                            Google Cloud Platform. Images can include a custom package set and
                            an activation key to automate the registration process.
                        </EmptyStateBody>
                        <Link to="/imagewizard" className="pf-c-button pf-m-primary" data-testid="create-image-action">
                        Create image
                        </Link>
                    </EmptyState>
                ) || (
                    <React.Fragment>
                        <TableToolbar>
                            <ToolbarGroup>
                                <ToolbarItem>
                                    <Link to="/imagewizard" className="pf-c-button pf-m-primary" data-testid="create-image-action">
                                        Create image
                                    </Link>
                                </ToolbarItem>
                            </ToolbarGroup>
                        </TableToolbar>
                        <Table
                            aria-label="Images"
                            rows={ rows }
                            cells={ this.state.columns }
                            data-testid="images-table">
                            <TableHeader />
                            <TableBody />
                        </Table>
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        composes: state.composes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateCompose: (compose) => dispatch(actions.updateCompose(compose)),
    };
}

ImagesTable.propTypes = {
    composes: PropTypes.object,
    updateCompose: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagesTable);
