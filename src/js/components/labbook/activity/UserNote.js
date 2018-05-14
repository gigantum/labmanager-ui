//vendor
import React, { Component } from 'react'
import SimpleMDE from 'simplemde'
import { WithContext as ReactTags } from 'react-tag-input';
//mutations
import CreateUserNoteMutation from 'Mutations/CreateUserNoteMutation'
//store
import store from 'JS/redux/store'
let simple;

export default class UserNote extends Component {
  constructor(props){
  	super(props);
    this.state = {
      'tags': [],
      'userSummaryText': '',
      'addNoteDisabled': true
    }

    this._addNote = this._addNote.bind(this)
    this._handleDelete = this._handleDelete.bind(this)
    this._handleAddition = this._handleAddition.bind(this)
    this._handleDrag= this._handleDrag.bind(this)
    this._toggleElements = this._toggleElements.bind(this);
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
      let fullscreenButton = document.getElementsByClassName('fa-arrows-alt')[0]
      fullscreenButton && fullscreenButton.addEventListener('click', this._toggleElements)
      let sideBySideButton = document.getElementsByClassName('fa-columns')[0]
      sideBySideButton && sideBySideButton.addEventListener('click', this._toggleElements)
    }
  }

  _toggleElements(evt) {
    let cardArr = Array.prototype.slice.call(document.getElementsByClassName('card'));
    let circleArr = Array.prototype.slice.call(document.getElementsByClassName('Activity__submenu-circle'));
    if(evt.target.className.indexOf('fa-columns') !== -1){
      if(document.getElementsByClassName('Labbook__header')[0].className.indexOf('hidden') === -1) {
        document.getElementsByClassName('Labbook__header')[0].classList.add('hidden')
      }
      if(document.getElementsByClassName('SideBar')[0].className.indexOf('hidden') === -1) {
        document.getElementsByClassName('SideBar')[0].classList.add('hidden')
      }
      cardArr.forEach((card)=>{
        if(card.className.indexOf('hidden') === -1) {
          card.classList.add('hidden');
        }
      })
      circleArr.forEach((circle)=>{
        if(circle.className.indexOf('hidden') === -1) {
          circle.classList.add('hidden');
        }
      })
    } else {
      document.getElementsByClassName('Labbook__header')[0].className.indexOf('hidden') === -1 ? document.getElementsByClassName('Labbook__header')[0].classList.add('hidden'): document.getElementsByClassName('Labbook__header')[0].classList.remove('hidden')
      document.getElementsByClassName('SideBar')[0].className.indexOf('hidden') === -1 ? document.getElementsByClassName('SideBar')[0].classList.add('hidden'): document.getElementsByClassName('SideBar')[0].classList.remove('hidden')
      cardArr.forEach((card)=>{
        card.className.indexOf('hidden') === -1 ? card.classList.add('hidden') : card.classList.remove('hidden')
      })
      circleArr.forEach((circle)=>{
        circle.className.indexOf('hidden') === -1 ? circle.classList.add('hidden') : circle.classList.remove('hidden')
      })
    }
  }

  /**
    @param {}
    calls CreateUserNoteMutation adds note to activity feed
  */
  _addNote = () => {
    const tags = this.state.tags.map(tag => {return (tag.text)});
    const {labbookName, owner} = store.getState().routes;
    const {labbookId} = this.props
    this.setState({'addNoteDisabled': true})
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
          'addNoteDisabled': false
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
      'addNoteDisabled': (summaryText.length === 0)
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

        <button
          className="UserNote__add-note"
          disabled={this.state.addNoteDisabled}
          onClick={() => {this._addNote()}}>Add Note</button>
      </div>
    )
  }
}
