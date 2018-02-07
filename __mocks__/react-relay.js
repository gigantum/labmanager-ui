
import { XMLHttpRequest } from 'xmlhttprequest';
import relayTestingUtils from 'relay-testing-utils';
import React,{Component} from 'react'
global.XMLHttpRequest = XMLHttpRequest;

const relay = jest.genMockFromModule('react-relay');


relay.createFragmentContainer = (c) => c;
relay.createPaginationContainer = (c) => c;
relay.createRefetchContainer = (c) => c;
relay.Component = Component


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

  // shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
  //   let variables = this.props.variables;
  //   let d;
  //   console.log(process.env.GIGANTUM_API)
  //   console.log(this.props.query().text)
  //   fetch(process.env.GIGANTUM_API, {
  //       method: 'POST',
  //       headers: {
  //         'content-type': 'application/json',
  //         'Access-Control-Allow-Origin': '*'
  //       },
  //       body: JSON.stringify({
  //         query: this.props.query().text,
  //         variables
  //       }),
  //     }).then(response => {
  //       console.log(response.json())
  //     //  resolve(response.json())
  //       d = response.json()
  //       return response.json()
  //     }).catch(error => {
  //       console.log('11')
  //       console.log(error)
  //       //reject(error)
  //       d = error
  //       return error
  //     })
  //
  //
  //   // let data = promise.then(
  //   //   (json) => {
  //   //     console.log(json)
  //   //     d = json
  //   // }).catch(
  //   //   (error) => {
  //   //     console.log('12')
  //   //     console.log(error)
  //   //   })
  //
  //   //while (!d) {}
  //   console.log(d)
  //   nextState.readyState = {
  //     props: d
  //   }
  //   console.log(nextProps)
  //   return (
  //     nextProps.render !== this.props.render ||
  //     nextState.readyState !== this.state.readyState
  //   );
  // }

  render() {
    return this.props.render((this.state.readyState))
  }
}
relay.QueryRenderer = ReactRelayQueryRenderer
module.exports = relay
