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
    FormSelect,
    FormSelectOption,
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
        api.osbuildInstallerViewsV1BuildImage(request).then(x => {
            console.log('response', x);
            alert('composing ' + x.data.compose_id);
        });
    }

    render() {
        return (
            <Card>
                <CardHeader>Create a new image</CardHeader>
                <CardBody>
                    <FormGroup label="Release" fieldId="release-select">
                        <FormSelect aria-label="FormSelect Input">
                            {[ '8-2', '8-1' ].map((option, index) => (
                                <FormSelectOption key={ index } value={ option } label={ option } />
                            ))}
                        </FormSelect>
                    </FormGroup>
                </CardBody>
                <CardBody>
                    <Form>
                        <FormGroup label="Package set" fieldId="package-set">
                            <Flex breakpointMods={ [{ modifier: FlexModifiers.column }] }>
                                <Button variant="secondary">Web server</Button>
                                <Button variant="secondary">SQL server</Button>
                                <Button variant="secondary">General database server</Button>
                                <Button variant="secondary">Performance sensitive workload</Button>
                                <Button variant="secondary">Show more options</Button>
                                <Button  onClick={ () => this.buildImage() } variant="Primary">Build image (this one actually works)</Button>
                            </Flex>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>);
    }
}

export default CreateImageCard;
