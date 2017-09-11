//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//Components
import NotesCard from './NotesCard'
import Loader from 'Components/shared/Loader'
//utilities
import Config from 'JS/config'


class Notes extends Component {
  /*
    function()
    pagination container loads more items
  */
  _loadMore() {
   this.props.relay.loadMore(
     10, // Fetch the next 10 feed items
     e => {
     },{
       name: 'labbook'
     }
   );
  }

  /*
    function(array)
    loops through notes array and sorts into days
    return Object
  */
  _transformNotes(notes){
    let notesTime = {}
    notes.edges.forEach((note) => {
      let date = (note.node.timestamp) ? new Date(note.node.timestamp) : new Date()
      let timeHash = date.getYear() + '_' + date.getMonth() + ' _' + date.getDate();
      if(notesTime[timeHash]){
        let newNoteObject = {edge: note, date: date}
        notesTime[timeHash].push(newNoteObject);
      }else{
        let newNoteObject = {edge: note, date: date}
        notesTime[timeHash] = [newNoteObject];

      }
    })

    return notesTime
  }

  render(){
    let notesTime = this._transformNotes(this.props.labbook.notes);
    if(this.props.labbook){
      return(
        <div key={this.props.labbook} className='Notes'>

          <div key={this.props.labbook + '_labbooks__container'} className="Notes__inner-container flex flex--row flex--wrap justify--space-around">

            <div key={this.props.labbook + '_labbooks__labook-id-container'} className="flex-1-0-auto">
              <p key={this.props.labbook + '_labbooks__labook-id'}>Labbook ID: {this.props.labbook.id}</p>

              <p key={this.props.labbook + '_labbooks__description'}>{this.props.labbook.description}</p>

              {
                Object.keys(notesTime).map(k => {


                    return (
                      <div key={k}>
                        <div className="Notes__date-tab flex flex--column justify--space-around">
                          <div className="Notes__date-day">{k.split('_')[2]}</div>
                          <div className="Notes__date-month">{ Config.months[parseInt(k.split('_')[1])] }</div>
                        </div>{
                          notesTime[k].map((obj) => {
                            return(<NotesCard
                                key={obj.edge.node.id}
                                edge={obj.edge}
                              />)

                            })
                          }
                      </div>)
                  })
              }
            </div>
          </div>
          <div className={this.props.labbook.notes.pageInfo.hasNextPage ? 'Notes__next-button-container' : 'hidden'}>
            <button key="load_more"
              onClick={() => this._loadMore()}
              title="Load More"
            >
              Next 10
            </button>
          </div>

        </div>
      )
    }else{
      return(
        <Loader />
      )
    }
  }
}

/*
  notes pagination container
  contains notes fragment and for query consumption
*/
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
              freeText
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
        return props.labbook && props.labbook.notes;
    },
    getFragmentVariables(prevVars, first) {
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {

    first = 10;
    name = props.labbookName;
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
