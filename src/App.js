import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';

class App extends Component {
    constructor() {
        super();

        this.state = {};
    }

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('osbuild-installer');
        this.appNav = insights.chrome.on('APP_NAVIGATION', event => this.props.history.push(`/${event.navId}`));
        insights.chrome.auth.getUser().then(data => {
            this.setState({ identity: data.identity });
        });
    }

    componentWillUnmount () {
        this.appNav();
    }

    render () {
        return (
            <Routes childProps={ this.props } />
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter (connect()(App));
