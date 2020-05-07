import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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

class CreateImageCard extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Card>
                <CardHeader>Create a new image</CardHeader>
                <CardBody>
                    <Form>
                        <FormGroup fieldId="show-create-image-wizard">
                            <Link to="/imagewizard">
                                <Flex breakpointMods={ [{ modifier: FlexModifiers.column }] }>
                                    <Button variant="secondary">Create image</Button>
                                </Flex>
                            </Link>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>);
    }
}

export default CreateImageCard;
