import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { EmptyState, EmptyStateVariant, EmptyStateIcon, EmptyStateBody, EmptyStateSecondaryActions,
    Pagination,
    Toolbar, ToolbarContent, ToolbarItem,
    Title } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { composesGet, composeGetStatus } from '../../store/actions/actions';
import DocumentationButton from '../sharedComponents/DocumentationButton';
import ImageBuildStatus from './ImageBuildStatus';
import Release from './Release';
import Target from './Target';
import ImageLink from './ImageLink';

const ImagesTable = () => {
    const [ page, setPage ] = useState(1);
    const [ perPage, setPerPage ] = useState(10);

    const composes = useSelector((state) => state.composes);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const pollComposeStatuses = () => {
        Object.entries(composes.byId).map(([ id, compose ]) => {
            /* Skip composes that have been complete */
            if (compose.image_status.status === 'success' || compose.image_status.status === 'failure') {
                return;
            }

            dispatch(composeGetStatus(id));
        });
    };

    useEffect(() => {
        dispatch(composesGet(perPage, 0));
        const intervalId = setInterval(() => pollComposeStatuses(), 8000);

        // clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    const onSetPage = (_, page) => {
        // if the next page's composes haven't been fetched from api yet
        // then fetch them with proper page index and offset
        if (composes.count > composes.allIds.length) {
            const pageIndex = page - 1;
            const offset = pageIndex * perPage;
            dispatch(composesGet(perPage, offset));
        }

        setPage(page);
    };

    const onPerPageSelect = (_, perPage) => {
        // if the new per page quantity is greater than the number of already fetched composes fetch more composes
        // if all composes haven't already been fetched
        if (composes.count > composes.allIds.length && perPage > composes.allIds.length) {
            dispatch(composesGet(perPage, 0));
        }

        // page should be reset to the first page when the page size is changed.
        setPerPage(perPage);
        setPage(1);
    };

    const timestampToDisplayString = (ts) => {
        // timestamp has format 2021-04-27 12:31:12.794809 +0000 UTC
        // must be converted to ms timestamp and then reformatted to Apr 27, 2021
        if (!ts) {
            return '';
        }

        // get YYYY-MM-DD format
        const date = ts.slice(0, 10);
        const ms = Date.parse(date);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const tsDisplay = new Intl.DateTimeFormat('en-US', options).format(ms);
        return tsDisplay;
    };

    const columns = [
        'Image name',
        'Created',
        'Release',
        'Target',
        'Status',
        'Instance',
        ''
    ];

    // the state.page is not an index so must be reduced by 1 get the starting index
    const itemsStartInclusive = (page - 1) * perPage;
    const itemsEndExlcusive = itemsStartInclusive + perPage;
    // only display the current pages section of composes. slice is inclusive, exclusive.
    const rows = composes.allIds.slice(itemsStartInclusive, itemsEndExlcusive).map(id => {
        const compose = composes.byId[id];
        return {
            compose,
            cells: [
                compose.request.image_name || id,
                timestampToDisplayString(compose.created_at),
                { title: <Release release={ compose.request.distribution } /> },
                { title: <Target
                    uploadType={ compose.request.image_requests[0].upload_request.type }
                    imageType={ compose.request.image_requests[0].image_type } /> },
                { title: <ImageBuildStatus status={ compose.image_status ? compose.image_status.status : '' } /> },
                { title: <ImageLink
                    imageStatus={ compose.image_status }
                    imageType={ compose.request.image_requests[0].image_type }
                    uploadOptions={ compose.request.image_requests[0].upload_request.options } /> }
            ]
        };
    });

    const actions = [
        {
            title: 'Recreate image',
            onClick: (_event, _rowId, rowData) => navigate('/imagewizard', { state: { composeRequest: rowData.compose.request }})
        }
    ];

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
                        <DocumentationButton />
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
                                    itemCount={ composes.count }
                                    perPage={ perPage }
                                    page={ page }
                                    onSetPage={ onSetPage }
                                    onPerPageSelect={ onPerPageSelect }
                                    widgetId="compose-pagination"
                                    data-testid="images-pagination"
                                    isCompact />
                            </ToolbarItem>
                        </ToolbarContent>
                    </Toolbar>
                    <Table
                        aria-label="Images"
                        rows={ rows }
                        cells={ columns }
                        actions={ actions }
                        data-testid="images-table">
                        <TableHeader />
                        <TableBody />
                    </Table>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

ImagesTable.propTypes = {
    composes: PropTypes.object,
    composesGet: PropTypes.func,
    composeGetStatus: PropTypes.func,
};

export default ImagesTable;
