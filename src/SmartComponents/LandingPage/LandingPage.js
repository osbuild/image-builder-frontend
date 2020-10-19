import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Flex, FlexItem, FlexModifiers } from '@patternfly/react-core';
import {
    PageHeader,
    PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';

import CreateImageCard from './CreateImageCard';
import ImagesCard from './ImagesCard.js';

/**
 * A smart component that handles all the api calls and data needed by the dumb components.
 * Smart components are usually classes.
 *
 * https://reactjs.org/docs/components-and-props.html
 * https://medium.com/@thejasonfile/dumb-components-and-smart-components-e7b33a698d43
 */
class LandingPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Image Builder' />
                </PageHeader>
                <Flex>
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers.column }, { modifier: FlexModifiers['flex-1'] }] }>
                        <CreateImageCard />
                    </FlexItem>
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers.column }, { modifier: FlexModifiers['flex-2'] }] }>
                        <ImagesCard />
                    </FlexItem>
                </Flex>
            </React.Fragment>
        );
    }
}

export default withRouter(LandingPage);
