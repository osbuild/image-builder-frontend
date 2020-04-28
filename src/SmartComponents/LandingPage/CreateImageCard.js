import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../redux';

import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Flex,
    FlexModifiers,
    Form,
    FormGroup,
} from '@patternfly/react-core';

import { DefaultApi } from '@redhat-cloud-services/osbuild-installer';

class CreateImageCard extends Component {
    constructor(props) {
        super(props);

        this.buildImage = this.buildImage.bind(this);
    }

    buildImage() {
        let request = {
            image_builds: [
                {
                    distribution: 'fedora-31',
                    architecture: 'x86_64',
                    image_type: 'qcow2',
                    repositories: [{ baseurl: 'http://download.fedoraproject.org/pub/fedora/linux/releases/30/Everything/x86_64/os/' }],
                }]
        };
        let api = new DefaultApi();
        let { updateCompose } = this.props;
        api.composeImage(request).then(response => {
            /* request failed? */
            if (response.data.compose_id === undefined) {
                return;
            }

            let compose = {};
            compose[response.data.compose_id] = {
                status: 'request sent',
                distribution: request.image_builds[0].distribution,
                architecture: request.image_builds[0].architecture,
                image_type: request.image_builds[0].image_type,
            };
            updateCompose(compose);
        });
    }

    render() {
        return (
            <Card>
                <CardHeader>Create a new image</CardHeader>
                <CardBody>
                    <Form>
                        <FormGroup label="Package set" fieldId="package-set">
                            <Flex breakpointMods={ [{ modifier: FlexModifiers.column }] }>
                                <Button  onClick={ () => this.buildImage() } variant="Primary">Build f31.x86_64 image</Button>
                            </Flex>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>);
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateCompose: (compose) => dispatch(actions.updateCompose(compose)),
    };
}

CreateImageCard.propTypes = {
    updateCompose: PropTypes.func,
};

export default connect(() => {}, mapDispatchToProps)(CreateImageCard);
