import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, classNames, Visibility } from '@patternfly/react-table';
import { TableToolbar } from '@redhat-cloud-services/frontend-components';
import { Button,
    ToolbarGroup, ToolbarItem,
    EmptyState, EmptyStateVariant, EmptyStateIcon, EmptyStateBody, EmptyStateSecondaryActions,
    Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

import ImageBuildStatus from './ImageBuildStatus';
import Release from './Release';
import Upload from './Upload';
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
        let { composes } = this.props;
        Object.entries(composes.byId).map(([ id, compose ]) => {
            /* Skip composes that have been complete */
            if (compose.image_status.status === 'success' || compose.image_status.status === 'failure') {
                return;
            }

            this.props.composeGetStatus(id);
        });
    }

    render() {
        let { composes } = this.props;
        const rows = Object.entries(composes.byId).map(([ id, compose ]) => {
            return {
                cells: [
                    id,
                    { title: <Upload uploadType={ compose.request.image_requests[0].image_type } /> },
                    { title: <Release release={ compose.request.distribution } /> },
                    { title: <ImageBuildStatus status={ compose.image_status ? compose.image_status.status : '' } /> },
                    ''
                ]
            };
        });
        return (
            <React.Fragment>
                { composes.allIds.length === 0 && (
                    <EmptyState variant={ EmptyStateVariant.large } data-testid="empty-state">
                        <EmptyStateIcon icon={ PlusCircleIcon } />
                        <Title headingLevel="h4" size="lg">
                            Create an image
                        </Title>
                        <EmptyStateBody>
                            Create OS images for deployment in Amazon Web Services,
                            Microsoft Azure and Google Cloud Platform. Images can
                            include a custom package set and an activation key to
                            automate the registration process.
                        </EmptyStateBody>
                        <Link to="/imagewizard" className="pf-c-button pf-m-primary" data-testid="create-image-action">
                        Create image
                        </Link>
                        <EmptyStateSecondaryActions>
                            <Button
                                component="a"
                                target="_blank"
                                variant="link"
                                icon={ <ExternalLinkAltIcon /> }
                                iconPosition="right"
                                isInline
                                href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8-beta/">
                                    Documentation
                            </Button>
                        </EmptyStateSecondaryActions>
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
        composeGetStatus: (id) => dispatch(actions.composeGetStatus(id)),
    };
}

ImagesTable.propTypes = {
    composes: PropTypes.object,
    composeGetStatus: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagesTable);
