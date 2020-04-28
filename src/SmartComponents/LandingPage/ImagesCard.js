import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../redux';

import {
    Card,
    CardHeader,
    CardBody,
} from '@patternfly/react-core';

import { DefaultApi } from '@redhat-cloud-services/osbuild-installer';

class ImagesCard extends Component {
    constructor(props) {
        super(props);
        this.pollComposeStatuses = this.pollComposeStatuses.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => this.pollComposeStatuses(), 8000);
    }

    pollComposeStatuses() {
        let api = new DefaultApi();
        let { updateCompose, composes } = this.props;
        Object.entries(composes).map(([ id, compose ]) => {
            api.getComposeStatus(id).then(response => {
                let newCompose = {};
                newCompose[id] = Object.assign({}, compose, { status: response.data.status });
                updateCompose(newCompose);
            });
        });
    }

    render() {
        let { composes } = this.props;
        return (
            <Card>
                <CardHeader>Pending composes</CardHeader>
                { Object.entries(composes).map(([ id, compose ]) => {
                    return <CardBody key={ id }>
                        <label>{ id }</label>
                        <p>{ compose.architecture }, { compose.distribution }, { compose.image_type }</p>
                        <p>{ compose.status }</p>
                    </CardBody>;
                })
                }
            </Card>);
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

ImagesCard.propTypes = {
    composes: PropTypes.object,
    updateCompose: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagesCard);
