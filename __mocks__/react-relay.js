
import { XMLHttpRequest } from 'xmlhttprequest';
import relayTestingUtils from 'relay-testing-utils';
import {commitMutation, graphql, QueryRenderer} from 'react-relay';
import React,{Component} from 'react'
global.XMLHttpRequest = XMLHttpRequest;

const relay = jest.genMockFromModule('react-relay');

const RelayPaginationProps = {
  // relay:{
      hasMore: jest.fn(),
      loadMore: jest.fn(),
      isLoading: jest.fn(),
      refetchConnection: jest.fn()

}

const makeRelayWrapper = (Comp) => {

  class Container extends Component{
    constructor(props, context){
    	super(props);

    	this.state = {};
    }

    render(){
      return React.createElement(Comp, {
        ...this.props,
        ...this.state.data,
        relay: RelayPaginationProps
      })
    }
  }

  return Container
}



relay.createFragmentContainer = (c) => c;
relay.createPaginationContainer = (Comp) => makeRelayWrapper(Comp)
relay.createRefetchContainer = (c) => c;

relay.Component = Component
relay.commitMutation = commitMutation
relay.graphql = graphql


const loadMore = (props, value, ha) => {
  console.log(props, value, ha)
  // let labbooks = json.data.labbookList.localLabbooks
  // labbooks.edges = labbooks.edges.slice(0, 5)
  return "labbooks"
}

relay.loadMore = loadMore

class ReactRelayQueryRenderer extends React.Component<Props, State, Data> {

  constructor(props: Props, context: Object, data: Data) {
    super(props, context);
    this._pendingFetch = true;
    this._rootSubscription = null;
    this._selectionReference = null;

    let name = props.query().query.selections[0].name;

    let type = name.charAt(0).toLowerCase() + name.slice(1)
    console.log(type)
    this.state = {
      readyState: {
        props: (type !== false) ? global.data[type] : global.data
      }
    }
  }


  render() {
    return this.props.render((this.state.readyState))
  }
}

relay.QueryRenderer = QueryRenderer //ReactRelayQueryRenderer

//relay.QueryRendererMock = ReactRelayQueryRenderer

module.exports = relay
