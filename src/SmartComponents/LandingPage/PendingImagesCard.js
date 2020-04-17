import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
    Card,
    CardHeader,
    CardBody,
} from '@patternfly/react-core';

import { DefaultApi } from '@redhat-cloud-services/osbuild-installer';

class PendingImagesCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            composeStatuses: {},
        };

        this.pollComposeIds = this.pollComposeIds.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => this.pollComposeIds(), 8000);
    }

    pollComposeIds() {
        let api = new DefaultApi();
        for (let id of this.props.pendingComposeIds) {
            api.getComposeStatus(id).then(response => {
                this.setState(oldState => {
                    let composeStatuses = Object.assign({}, oldState.composeStatuses);
                    composeStatuses[id] = response.data.status;
                    return { composeStatuses };
                });
            });
        }
    }

    render() {
        return (
            <Card>
                <CardHeader>Pending composes</CardHeader>
                { Object.entries(this.state.composeStatuses).map(([ id, status ]) => {
                    return <CardBody key={ id }><label>{ id }</label><p>{ status }</p></CardBody>;
                })
                }
            </Card>);
    }
}

PendingImagesCard.propTypes = {
    pendingComposeIds: PropTypes.array,
};

export default PendingImagesCard;
