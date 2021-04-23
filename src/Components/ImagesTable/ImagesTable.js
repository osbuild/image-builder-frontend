import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, classNames, Visibility } from '@patternfly/react-table';
import { Button,
    EmptyState, EmptyStateVariant, EmptyStateIcon, EmptyStateBody, EmptyStateSecondaryActions,
    Pagination,
    Toolbar, ToolbarContent, ToolbarItem,
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
            ],
            page: 1,
            perPage: 10,
        };
        this.pollComposeStatuses = this.pollComposeStatuses.bind(this);
        this.onSetPage = this.onSetPage.bind(this);
        this.onPerPageSelect = this.onPerPageSelect.bind(this);
    }

    componentDidMount() {
        this.props.composesGet(this.state.perPage, 0);
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

    onSetPage(_, page) {
        // if the next page's composes haven't been fetched from api yet
        // then fetch them with proper page index and offset
        if (this.props.composes.count > this.props.composes.allIds.length) {
            const pageIndex = page - 1;
            const offset = pageIndex * this.state.perPage;
            this.props.composesGet(this.state.perPage, offset);
        }

        this.setState({ page });
    }

    onPerPageSelect(_, perPage) {
        // if the new per page quantity is greater than the number of already fetched composes fetch more composes
        // if all composes haven't already been fetched
        if (this.props.composes.count > this.props.composes.allIds.length && perPage > this.props.composes.allIds.length) {
            this.props.composesGet(perPage, 0);
        }

        // page should be reset to the first page when the page size is changed.
        this.setState({ perPage, page: 1 });
    }

    render() {
        let { composes } = this.props;

        // the state.page is not an index so must be reduced by 1 get the starting index
        const itemsStartInclusive = (this.state.page - 1) * this.state.perPage;
        const itemsEndExlcusive = itemsStartInclusive + this.state.perPage;
        // only display the current pages section of composes. slice is inclusive, exclusive.
        const rows = composes.allIds.slice(itemsStartInclusive, itemsEndExlcusive).map(id => {
            const compose = composes.byId[id];
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
                        <Toolbar>
                            <ToolbarContent>
                                <ToolbarItem>
                                    <Link to="/imagewizard" className="pf-c-button pf-m-primary" data-testid="create-image-action">
                                        Create image
                                    </Link>
                                </ToolbarItem>
                                <ToolbarItem variant="pagination" align={ { default: 'alignRight' } }>
                                    <Pagination
                                        itemCount={ this.props.composes.count }
                                        perPage={ this.state.perPage }
                                        page={ this.state.page }
                                        onSetPage={ this.onSetPage }
                                        onPerPageSelect={ this.onPerPageSelect }
                                        widgetId="compose-pagination"
                                        data-testId="images-pagination"
                                        isCompact />
                                </ToolbarItem>
                            </ToolbarContent>
                        </Toolbar>
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
        composesGet: (limit, offset) => dispatch(actions.composesGet(limit, offset)),
        composeGetStatus: (id) => dispatch(actions.composeGetStatus(id)),
    };
}

ImagesTable.propTypes = {
    composes: PropTypes.object,
    composesGet: PropTypes.func,
    composeGetStatus: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagesTable);
