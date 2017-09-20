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
let pagination = false;
let isLoadingMore = false;
let counter = 10;
let notesContainer;
class Notes extends Component {
  constructor(props){
  	super(props);
  	this.state = {};

    notesContainer = this;
  }

  componentDidMount() {
    let relay = this.props.relay;
    let notes = this.props.labbook.notes
    let cursor =  notes.edges[0].cursor;
    pagination = false;
    setInterval(function(){
      relay.refetchConnection(
        counter,
        (response) =>{
        },
        {
          cursor: cursor
        }
      )
    }, 2000);


    window.addEventListener('scroll', function(e){
      let root = document.getElementById('root')
      let distanceY = window.innerHeight + document.body.scrollTop + 40,
          expandOn = root.offsetHeight,
          footer = document.getElementById("footer");
          console.log(distanceY, expandOn)
      if ((distanceY > expandOn) && !isLoadingMore && notes.pageInfo.hasNextPage) {
          notesContainer._loadMore(e);
      }
    });
  }
  /*
    function()
    pagination container loads more items
  */
  _loadMore() {
    isLoadingMore = true
    pagination = true;
   this.props.relay.loadMore(
     counter, // Fetch the next 10 feed items
     e => {
       isLoadingMore = false;
     },{
       name: 'labbook'
     }
   );
   counter += 10
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
          {/* <div className={this.props.labbook.notes.pageInfo.hasNextPage ? 'Notes__next-button-container' : 'hidden'}>
            <button key="load_more"
              className="Notes__load-more"
              onClick={() => this._loadMore()}
              title="Load More"
            >
              Next 10
            </button>
          </div> */}

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
    getFragmentVariables(prevVars, first, cursor) {

      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {

    cursor = pagination ? props.labbook.notes.edges[props.labbook.notes.edges.length - 1].cursor : null
    first = counter;
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
     query NotesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
       labbook(name: $name, owner: $owner){
         id
         description
         ...Notes_labbook
       }
     }`

  }
)
