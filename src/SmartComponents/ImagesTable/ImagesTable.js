import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../redux';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, classNames, Visibility } from '@patternfly/react-table';
import { TableToolbar } from '@redhat-cloud-services/frontend-components';

import ImageBuildStatus from '../../PresentationalComponents/ImageBuildStatus/ImageBuildStatus';
import Release from '../../PresentationalComponents/Release/Release';

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
            api.getComposeStatus(id).then(response => {
                let newCompose = {};
                newCompose[id] = Object.assign({}, compose, { status: response.status });
                updateCompose(newCompose);
            });
        });
    }

    render() {
        let { composes } = this.props;
        const uploadOptions = {
            aws: 'Amazon Web Services'
        };
        const rows = Object.entries(composes).map(([ id, compose ]) => {
            return {
                cells: [
                    id,
                    uploadOptions[compose.image_type] ? uploadOptions[compose.image_type] : compose.image_type,
                    { title: <Release release={ compose.distribution } /> },
                    { title: <ImageBuildStatus status={ compose.status } /> },
                    ''
                ]
            };
        });
        return (
            <React.Fragment>
                <TableToolbar>
                    <Link to="/imagewizard" className="pf-c-button pf-m-primary" data-testid="create-image-action">
                        Create image
                    </Link>
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
