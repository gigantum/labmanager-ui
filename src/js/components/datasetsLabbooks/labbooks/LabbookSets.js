import React, { Component } from 'react'
import {
  createFragmentContainer,
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../../createRelayEnvironment'
import CreateLabbook from './CreateLabbook'

const LabbookQuery = graphql`query LabbookSetsQuery($first: Int!){
  localLabbooks(first:$first){
    edges{
      node{
        name
        description
      }
    }
  }
}`

class LabbookSets extends Component {
  constructor(props){

    super(props)

    this.handler = this.handler.bind(this)

  }

  handler(e) {
    e.preventDefault()
     this.setState({
       'value': "dsds"
     })
  }

  /*
    function(string) inputs a labbook name
    routes to that labbook
  */
  _goToLabbook(labbookName){
    this.props.history.replace(`/labbooks/${labbookName}`)
  }

  render(){

    return(
      <div className='labbooks__container'>

        <QueryRenderer
          environment={environment}
          query={LabbookQuery}
          variables={{
            first: 20
          }}
          render={({error, props}) => {

            if (error) {

              return <div>{error.message}</div>
            } else if (props) {
              return (
                <div>
                  <CreateLabbook
                    handler={this.handler}
                    history={this.props.history}
                  />
                  <div className='labbooks__container flex flex--row flex--wrap justify--space-around'>
                    {
                      props.localLabbooks.edges.map((edge) => {
                        return (
                          <div
                            key={edge.node.id}
                            onClick={() => this._goToLabbook(edge.node.name)}
                            className='labbook__panel'>
                              {edge.node.name}
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              )
            }
            return (
              <div>
                <CreateLabbook
                  handler={this.handler}
                  history={this.props.history}
                />
              </div>
            )
          }}
        />
      </div>
    )
  }
}

export default createFragmentContainer(LabbookSets, graphql`
fragment LabbookSets_viewer on Query {
  localLabbooks(first: 20) @connection(key: "LabbookSets_localLabbooks", filters: []) {
   edges {
     node {
       description
       name
     }
   }
 }
}`)
