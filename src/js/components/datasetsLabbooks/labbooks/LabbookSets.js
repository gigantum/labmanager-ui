import React, { Component } from 'react'
import {
  createPaginationContainer,
  QueryRenderer,
  graphql
} from 'react-relay'

import WizardModal from './../../wizard/WizardModal'

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


  _loadMore(){

    this.props.relay.loadMore(
      5, // Fetch the next 10 feed items
      e => {
        console.log(e);
      },{
        'first': 10
      }
    );

    this.props.relay.refetchConnection(
      10,
      e =>{console.log(e)}
    )
  }

  render(){

      return(
        <div className="LabbooksSets">
          <WizardModal
            handler={this.handler}
            history={this.props.history}
            {...this.props}
          />
          <div className='LabbooksSets__labbooks flex flex--row flex--wrap justify--center'>
            {

              this.props.localLabbooks.edges.map((edge) => {
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
          <div className="LabooksSets__next-button-container">
            <button key="load_more"
              onClick={() => this._loadMore()}
              title="Load More"
            >
              Next 5
            </button>
          </div>
        </div>
      )

  }
}

export default createPaginationContainer(
  LabbookSets,
  {
    localLabbooks: graphql`
      fragment LabbookSets_localLabbooks on LabbookConnection @connection(key: "LabbookSets_localLabbooks"){
          edges {
            node {
              name
              description
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.localLabbooks && props.localLabbooks.edges;
    },
    getFragmentVariables(prevVars, first) {

      first = 10;
      return {
        ...prevVars,
        first: first
      };
    },
    getVariables(props, {first, cursor}, fragmentVariables) {

      first = 10;
      cursor = props.localLabbooks.pageInfo.startCursor;
      return {
        first,
        cursor
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
      };
    },
    query: graphql`
      query LabbookSetsPaginationQuery(
        $first: Int!
        $cursor: String!
      ) {
        localLabbooks(first: $first, after: $cursor) {
          edges {
            node {
              name
              description
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
    `
  }
);
