
import { XMLHttpRequest } from 'xmlhttprequest';
import relayTestingUtils from 'relay-testing-utils';
import {commitMutation, graphql, QueryRenderer} from 'react-relay';
import React,{Component} from 'react'
global.XMLHttpRequest = XMLHttpRequest;

const relay = jest.genMockFromModule('react-relay');

const RelayPaginationProps = {
  // relay:{
      hasMore: jest.fn(),
      loadMore: () => {

      },
      isLoading: jest.fn()

}

// function makeRelayWrapper<
//   Props: {},
//   TComponent: React.ComponentType<Props>,
// >(
//   Component: TComponent,
// ) : React.ComponentType<
//   $RelayProps<React.ElementConfig<TCompnent>, RelayPaginationProps>,> {
//
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


// return <Comp {...relayProps}/>

  // return function () {
  //
  //      console.log(Comp)
  //      return <Comp {...props} {...relayProps}/>;
  //  };


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
;

  constructor(props: Props, context: Object, data: Data) {
    super(props, context);
    this._pendingFetch = true;
    this._rootSubscription = null;
    this._selectionReference = null;

    let type =  props.query().query.selections[0].name;

    type = type.charAt(0).toLowerCase() + type.slice(1)
    console.log(type, global.data)
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

relay.QueryRenderer = ReactRelayQueryRenderer

//relay.QueryRendererMock = ReactRelayQueryRenderer

module.exports = relay
