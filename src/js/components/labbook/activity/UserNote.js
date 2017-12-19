import React, { Component } from 'react'
import SimpleMDE from 'simplemde'
import { WithContext as ReactTags } from 'react-tag-input';
import CreateUserNoteMutation from 'Mutations/CreateUserNoteMutation'

let simple;

export default class UserNote extends Component {
  constructor(props){
  	super(props);
    this.state = {
      'addNoteEnabled': false,
      'tags': [],
      'userSummaryText': '',
    }

    this._addNote = this._addNote.bind(this)
    this._handleDelete = this._handleDelete.bind(this)
    this._handleAddition = this._handleAddition.bind(this)
    this._handleDrag= this._handleDrag.bind(this)
  }
  /**
    @param {}
    after component mounts apply simplemde to the dom element id:markdown
  */
  componentDidMount() {
    if(document.getElementById('markDown')){
      simple = new SimpleMDE({
        element: document.getElementById('markDown'),
        spellChecker: true
      });
    }
  }

  /**
    @param {}
    calls CreateUserNoteMutation adds note to activity feed
  */
  _addNote = () => {
    const tags = this.state.tags.map(tag => {return (tag.text)});
    const {labbookName, labbookId} = this.props;
    const owner = this.props.owner
    CreateUserNoteMutation(
      labbookName,
      this.state.userSummaryText,
      simple.value(),
      owner,
      [],
      tags,
      labbookId,
      (response, error) => {
        this.props.hideLabbookModal();
        this.setState({
          'tags': [],
          'userSummaryText': '',
          'addNoteEnabled': false
        })

      }
    )

  }

  /**
    @param {object} event
    calls updates state for summary text
    and enables addNote button if > 0
  */
  _setUserSummaryText(evt){

    const summaryText =  evt.target.value;

    this.setState({
      'userSummaryText': summaryText,
      'addNoteEnabled': (summaryText.length > 0)
    })
  }
  /**
    @param {number} i
    removes tag from list
  */
   _handleDelete = (i) => {
       let {tags} = this.state;

       tags.splice(i, 1);

       this.setState({tags: tags});
   }
   /**
     @param {number} i
     add tag to list
   */
   _handleAddition = (tag) => {

       let {tags} = this.state;

       tags.push({
           id: tags.length + 1,
           text: tag
       });

       this.setState({tags: tags});
   }
   /**
     @param {number} i
     drags tag to new position.
   */
   _handleDrag = (tag, currPos, newPos) => {
       let {tags} = this.state;

       // mutate array
       tags.splice(currPos, 1);
       tags.splice(newPos, 0, tag);

       // re-render
       this.setState({ tags: tags });
   }


  render(){
    const {tags} = this.state;
    return(
      <div className="UserNote flex flex--column">
        <input
          id="UserNoteTitle"
          placeholder="Add a summary title"
          onKeyUp={
            (e) => this._setUserSummaryText(e)
          }
          className="UserNote__summary">
        </input>

        <textarea ref="markdown"
          className="UserNote__summary"
          id="markDown"></textarea>

        <ReactTags
              id='TagsInput'
              tags={tags}
              handleDelete={(index) => {this._handleDelete(index)}}
              handleAddition={(tag) => {this._handleAddition(tag)}}
              handleDrag={(tag, currPos, newPos) => {this._handleDrag(tag, currPos, newPos)}} />
        <button className="UserNote__add-note" disabled={!this.state.addNoteEnabled} onClick={() => {this._addNote()}}>Add Note</button>
      </div>
    )
  }
}
