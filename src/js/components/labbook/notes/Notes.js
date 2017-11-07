//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//Components
import NotesCard from './NotesCard'
import Loader from 'Components/shared/Loader'
import UserNote from './../UserNote'

//utilities
import Config from 'JS/config'

//lacoal variables
let pagination = false;
let isLoadingMore = false;
let counter = 2;

class Notes extends Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modalVisible': false,
      'isPaginting': false
    };
    this._loadMore = this._loadMore.bind(this)
    this._toggleNote = this._toggleNote.bind(this)
    this._hideAddNote = this._hideAddNote.bind(this)
    this._loadMore()
    this._handleScroll = this._handleScroll.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      'isPaginting': false
    })
  }

  /**
  *  @param {}
  *   add scroll listener
  *   add interval to poll for new notes
  */
  componentDidMount() {

    let notes = this.props.labbook.notes

    pagination = false;

    window.addEventListener('scroll', this._handleScroll);
  }

  componentWillUnmount() {

    window.removeEventListener('scroll', this._handleScroll);
  }
  /**
  *  @param {}
  *  pagination container loads more items
  */
  _loadMore() {

    isLoadingMore = true
    pagination = true;
    this.setState({
      'isPaginting': true
    })
    this.props.relay.loadMore(
     counter, // Fetch the next 10 feed items
     e => {
       isLoadingMore = false;
       this.setState({
         'isPaginting': false
       })
     },{
       name: 'labbook'
     }
   );
   counter += 5
  }
  /**
  *  @param {evt}
  *   handles scolls and passes off loading to pagination container
  *
  */
  _handleScroll(evt){
    let notes = this.props.labbook.notes
    let root = document.getElementById('root')

    let distanceY = window.innerHeight + document.documentElement.scrollTop + 40,
        expandOn = root.scrollHeight;
    if ((distanceY > expandOn) && !isLoadingMore && notes.pageInfo.hasNextPage) {
        this._loadMore(evt);
    }
  }
  /**
  *   @param {array}
  *   loops through notes array and sorts into days
  *   @return {Object}
  */
  _transformNotes(notes){

    let notesTime = {}
    notes.edges.forEach((note) => {
      let date = (note.node.timestamp) ? new Date(note.node.timestamp) : new Date()
      let timeHash = date.getYear() + '_' + date.getMonth() + ' _' + date.getDate();
      let newNoteObject = {edge: note, date: date}
      notesTime[timeHash] ? notesTime[timeHash].push(newNoteObject) : notesTime[timeHash] = [newNoteObject];
    })

    return notesTime
  }

  _toggleNote(){
    this.setState({
      'modalVisible': !this.state.modalVisible
    })
  }

  _hideAddNote(){
    this.setState({
      'modalVisible': false
    })
  }

  render(){
    let notesTime = this._transformNotes(this.props.labbook.notes);

    if(this.props.labbook){
      return(
        <div key={this.props.labbook} className='Notes'>

          <div key={this.props.labbook + '_labbooks__container'} className="Notes__inner-container flex flex--row flex--wrap justify--space-around">

            <div key={this.props.labbook + '_labbooks__labook-id-container'} className="Notes__sizer flex-1-0-auto">

              {
                Object.keys(notesTime).map((k, i) => {

                  return (
                    <div key={k}>


                      <div className="Notes__date-tab flex flex--column justify--space-around">
                        <div className="Notes__date-day">{k.split('_')[2]}</div>
                        <div className="Notes__date-month">{ Config.months[parseInt(k.split('_')[1])] }</div>
                      </div>

                      {
                        (i===0) && (
                          <div className="UserNote__container">
                            <div className="Notes__user-note"

                              onClick={() => this._toggleNote()}>
                              <div className={this.state.modalVisible ? 'Notes__user-note--remove' : 'Notes__user-note--add'}></div>
                              <h5>Add Note</h5>

                            </div>
                            <div className={this.state.modalVisible ? 'Notes__add NotesCard' : 'hidden'}>

                              {
                                (this.state.modalVisible) &&
                                <UserNote
                                  labbookId={this.props.labbook.id}
                                  {...this.props}
                                  labbookName={this.props.labbookName}
                                  hideLabbookModal={this._hideAddNote}/>
                              }
                            </div>
                        </div>
                        )
                      }

                      <div key={k + 'card'}>

                        {
                          notesTime[k].map((obj) => {
                          return(<NotesCard
                              key={obj.edge.node.id}
                              edge={obj.edge}
                            />)

                          })
                        }

                    </div>

                  </div>)
                })
              }
              <div
                key="Notes-loader-card-1"
                className={isLoadingMore ? 'NotesCard NotesCard__loader card': 'hiddden'}>
              </div>
              <div
                key="Notes-loader-card-2"
                className={isLoadingMore ? 'NotesCard NotesCard__loader card': 'hiddden'}>
              </div>
              <div
                key="Notes-loader-card-3" className={isLoadingMore ? 'NotesCard NotesCard__loader card': 'hiddden'}>
              </div>
              <div
                key="Notes-loader-card-4"
                 className={isLoadingMore ? 'NotesCard NotesCard__loader card': 'hiddden'}>
              </div>
              <div
                key="Notes-loader-card-5" className={isLoadingMore ? 'NotesCard NotesCard__loader card': 'hiddden'}>
              </div>
            </div>
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
    getFragmentVariables(prevVars, first, cursor) {

      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {
    const username = localStorage.getItem('username')
    cursor = pagination ? props.labbook.notes.edges[props.labbook.notes.edges.length - 1].cursor : null
    first = counter;
    name = props.labbookName;
    owner = username;
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
