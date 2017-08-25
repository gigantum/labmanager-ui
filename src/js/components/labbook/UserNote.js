import React, { Component } from 'react'
import SimpleMDE from 'simplemde'
import { WithContext as ReactTags } from 'react-tag-input';
import CreateUserNoteMutation from '../../mutations/CreateUserNoteMutation'
let simple;
let addNote;
export default class UserNote extends React.Component {
  constructor(props){
  	super(props);
    this.state = {
      'addNoteEnabled': false,
      'tags': []
    }

    addNote = this;
  }
  componentDidMount() {
    simple = new SimpleMDE({
      element: document.getElementById("markDown"),
      spellChecker: true
    });
  }

  _addNote(){
    const tags = this.state.tags.map(tag => {return (tag.text)});
    CreateUserNoteMutation(
      this.props.labbookName,
      this.state.userSummaryText,
      simple.value(),
      'default',
      [],
      tags,
      this.props.labbookId,
      (response, error) => {
        addNote.props.hideLabbookModal();
        addNote.setState({
          'tags': [],
          'userSummaryText': '',
          'addNoteEnabled': false
        })

      }
    )

  }

  _setUserSummaryText(e){

    const summaryText =  e.target.value;
    this.setState({
      'userSummaryText': summaryText,
      'addNoteEnabled': (summaryText.length > 0)
    })
  }

   handleDelete(i) {
       let tags = addNote.state.tags;
       tags.splice(i, 1);
       addNote.setState({tags: tags});
   }

   handleAddition(tag) {
       let tags = addNote.state.tags;

       tags.push({
           id: tags.length + 1,
           text: tag
       });
       addNote.setState({tags: tags});
   }

   handleDrag(tag, currPos, newPos) {
       let tags = addNote.state.tags;

       // mutate array
       tags.splice(currPos, 1);
       tags.splice(newPos, 0, tag);

       // re-render
       addNote.setState({ tags: tags });
   }


  render(){
    const {tags} = this.state;
    return(
      <div className="UserNote flex flex--column">
        <input placeholder="Add a summary title" onKeyUp={(e) => this._setUserSummaryText(e)} className="UserNote__summary"></input>
        <textarea className="UserNote__summary" id="markDown"></textarea>

        <ReactTags tags={tags}
                    // suggestions={suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />
        <button className="UserNote__add-note" disabled={!this.state.addNoteEnabled} onClick={() => this._addNote()}> Add Note</button>
      </div>
    )
  }
}
