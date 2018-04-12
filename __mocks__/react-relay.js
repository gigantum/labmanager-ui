
import { XMLHttpRequest } from 'xmlhttprequest';
import relayTestingUtils from 'relay-testing-utils';
import {commitMutation, graphql, QueryRenderer} from 'react-relay';
import React,{Component} from 'react'
global.XMLHttpRequest = XMLHttpRequest;

const relay = jest.genMockFromModule('react-relay');


relay.createFragmentContainer = (c) => c;
relay.createPaginationContainer = (c) => c;
relay.createRefetchContainer = (c) => c;
relay.Component = Component
relay.commitMutation = commitMutation
relay.graphql = graphql

class ReactRelayQueryRenderer extends React.Component<Props, State, Data> {
;

  constructor(props: Props, context: Object, data: Data) {
    super(props, context);
    this._pendingFetch = true;
    this._rootSubscription = null;
    this._selectionReference = null;

    let type =  props.query().query.selections[0].name;

    type = type.charAt(0).toLowerCase() + type.slice(1)

    this.state = {
      readyState: {
        props: global.data, //(type !== false) ? global.data[type] : global.data
      }
    }
  }


  render() {
    return this.props.render((this.state.readyState))
  }
}
relay.QueryRenderer = QueryRenderer
module.exports = relay
