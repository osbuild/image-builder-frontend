import PropTypes from 'prop-types';
import React, { Component } from 'react';

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
        api.composeImage(request).then(response => {
            this.props.onCompose(response.data.compose_id);
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

CreateImageCard.propTypes = {
    onCompose: PropTypes.func,
};

export default CreateImageCard;
