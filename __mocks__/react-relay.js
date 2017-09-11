import relayTestingUtils from 'relay-testing-utils';
import {Component} from 'react'
const relay = jest.genMockFromModule('react-relay');



relay.createFragmentContainer = (c) => c;
relay.createPaginationContainer = (c) => c;
relay.createRefetchContainer = (c) => c;
relay.Component = Component

module.exports = relay
