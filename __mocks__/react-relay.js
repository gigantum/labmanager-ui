import relayTestingUtils from 'relay-testing-utils';
import React,{Component} from 'react'
const relay = jest.genMockFromModule('react-relay');


relay.createFragmentContainer = (c) => c;
relay.createPaginationContainer = (c) => c;
relay.createRefetchContainer = (c) => c;
relay.Component = Component




class ReactRelayQueryRenderer extends React.Component<Props, State> {
;

  constructor(props: Props, context: Object) {
    super(props, context);
    console.log(props)
    let that = this
    let data = props.environment._network.fetch(props.query(), props.variables).then(({response, error})=>{
      console.log(response, error)
      that.state = {
        readyState: true,
        data: data
      };

      props = data
    })

    this.state = {
      readyState: false,
      data: data
    };
    console.log(data)

  }

  render() {
    // Note that the root fragment results in `readyState.props` is already
    // frozen by the store; this call is to freeze the readyState object and
    // error property if set.
    // if (__DEV__) {
    //   deepFreeze(this.state.readyState);
    // }
    return this.props.render(this.state.readyState);
  }
}
relay.QueryRenderer = ReactRelayQueryRenderer

module.exports = relay
