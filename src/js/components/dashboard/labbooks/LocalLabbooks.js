import React, { Component } from 'react'
import {
  createPaginationContainer,
  QueryRenderer,
  graphql
} from 'react-relay'

import WizardModal from './../../wizard/WizardModal'

class LocalLabbooks extends Component {
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


  _loadMore(e){
    e.preventDefault();
    console.log(this)
    console.log(this.props.relay.hasMore())
    debugger
    this.props.relay.loadMore(
      10, // Fetch the next 10 feed items
      (e, r) => {
        console.log(e);
        this.props.relay.refetchConnection(12,(e) => {console.log(e)})
      }
    );

    // this.props.relay.refetchConnection(
    //   10,
    //   e =>{console.log(e)}
    // )
  }

  render(){
      this.props
      if(this.props.localLabbooks){
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
              onClick={(e) => this._loadMore(e)}
              title="Load More"
            >
              Next 5
            </button>
          </div>
        </div>
      )
    }else{
      return(<div>Loading</div>)
    }

  }
}

export default createPaginationContainer(
  LocalLabbooks,
  {
    query: graphql`
      fragment LocalLabbooks_query on Query @connection(key: "LocalLabbooks_localLabbooks"){
        localLabbooks(first: $first, after:$cursor){
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
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.localLabbooks;
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
      query LocalLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
      ) {
          ...LocalLabbooks_query
      }
    `
  }
);
