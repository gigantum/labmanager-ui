import React, { Component } from 'react'
import {
  createFragmentContainer,
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../../createRelayEnvironment'
import CreateLabbook from './CreateLabbook'
//import molecules from '.../../../../images/icons/molecule.svg'

const LabbookQuery = graphql`query LabbookSetsQuery($first: Int!){
  localLabbooks(first:$first) @connection(key: "LabbookSets_localLabbooks", filters: []) {
    edges{
      node{
        name
        description
      }
    }
  }
}`

export default class LabbookSets extends Component {
  constructor(props){

    super(props)

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
      <div className='Labbooks'>

        <QueryRenderer
          environment={environment}
          query={LabbookQuery}
          variables={{
            first: 20
          }}

          render={({error, props}) => {

            if (error) {
              console.log(error)
              return <div>{error.message}</div>
            } else if (props) {
              return (
                <div>
                  <CreateLabbook
                    history={this.props.history}
                    {...props}
                  />
                  <div className='LabbooksSets flex flex--row flex--wrap justify--start'>
                    {

                      props.localLabbooks.edges.map((edge) => {
                        return (
                          <div
                            key={edge.node.name}
                            onClick={() => this._goToLabbook(edge.node.name)}
                            className='LabbooksSets__panel flex flex--column justify--space-between'>
                              <h4>{edge.node.name}</h4>
                              <p>{edge.node.description}</p>
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

                  history={this.props.history}
                  {...this.props}
                />
              </div>
            )
          }}
        />
      </div>
    )
  }
}

// export default createFragmentContainer(LabbookSets, graphql`
// fragment LabbookSets_viewer on Query {
//   localLabbooks(first: 20) @connection(key: "LabbookSets_localLabbooks", filters: []) {
//    edges {
//      node {
//        description
//        name
//      }
//    }
//  }
// }`)
