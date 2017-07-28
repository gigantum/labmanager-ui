import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import environment from '../../../createRelayEnvironment'
import NotesCard from './NotesCard'


class Notes extends Component {
  // constructor(props){
  // 	super(props);
  // }

  _loadMore() {
   this.props.relay.loadMore(
     10, // Fetch the next 10 feed items
     e => {
       console.log(e);
     },{
       name: 'labbook'
     }
   );
  }

  render(){
    if(this.props.labbook){
      return(
        <div key={this.props.labbook} className='notes__container'>

          <div key={this.props.labbook + '_labbooks__container'} className="labbooks__container flex flex--row flex--wrap justify--space-around">

            <div key={this.props.labbook + '_labbooks__labook-id-container'} className="flex-1-0-auto">
              <p key={this.props.labbook + '_labbooks__labook-id'}>Labbook ID: {this.props.labbook.id}</p>

              <p key={this.props.labbook + '_labbooks__description'}>{this.props.labbook.description}</p>

              {
                this.props.labbook.notes.edges.map((edge) => {
                  return(
                    <NotesCard
                      key={edge.commit}
                      edge={edge}
                    />)
                  })
              }
            </div>

          </div>

          <button
            onClick={() => this._loadMore()}
            title="Load More"
          >
            Next 20
          </button>

        </div>
      )
    }else{
      return(<div>loading</div>)
    }
  }
}

export default createPaginationContainer(
  Notes,
  {
    labbook: graphql`
      fragment Notes_labbook on Labbook{
        notes(first: $first, after: $cursor) @connection(key: "Notes_notes"){
          edges{
            node{
              linkedCommit
              commit
              level
              tags
              timestamp
              message
              id
              author
            }
            cursor
          }
          pageInfo{
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }`
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
        // console.log(props);
        return props.labbook && props.labbook.notes;
    },
    getFragmentVariables(prevVars, first) {
      console.log(first)
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {
    //console.log(props, first, cursor, name, owner, fragmentVariables)
    first = 10;
    name = props.labbook_name;
    owner = 'default';
     return {
       first,
       cursor,
       name,
       owner
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
   query NotesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String!){
     labbook(name: $name, owner: $owner){
       id
       description
       ...Notes_labbook
     }
   }`

  }
)
