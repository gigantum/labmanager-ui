// vendor
import React, { Component } from 'react';
import Loadable from 'react-loadable';
// mutations
import CreateUserNoteMutation from 'Mutations/CreateUserNoteMutation';
// store
import store from 'JS/redux/store';

let simple;

const Loading = () => <div />;

const ReactTags = Loadable({
  loader: () => import('react-tag-input').then(({ WithContext }) => WithContext),
  loading: Loading,
});

export default class UserNote extends Component {
  constructor(props) {
  	super(props);
    this.state = {
      tags: [],
      userSummaryText: '',
      addNoteDisabled: true,
      editorFullscreen: false,
    };

    this._addNote = this._addNote.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleAddition = this._handleAddition.bind(this);
    this._handleDrag = this._handleDrag.bind(this);
  }
  /**
    @param {}
    after component mounts apply simplemde to the dom element id:markdown
  */
  componentDidMount() {
    import('simplemde').then((comp) => {
      if (document.getElementById('markDown')) {
        const Simple = comp.default;
        simple = new Simple({
          element: document.getElementById('markDown'),
          spellChecker: true,
        });
        const fullscreenButton = document.getElementsByClassName('fa-arrows-alt')[0];
        fullscreenButton && fullscreenButton.addEventListener('click', () => this.props.changeFullScreenState());
        const sideBySideButton = document.getElementsByClassName('fa-columns')[0];
        sideBySideButton && sideBySideButton.addEventListener('click', () => this.props.changeFullScreenState(true));
      }
    });
  }

  /**
    @param {}
    calls CreateUserNoteMutation adds note to activity feed
  */
  _addNote = () => {
    const tags = this.state.tags.map(tag => (tag.text));
    const { labbookName, owner } = store.getState().routes;
    const { labbookId } = this.props;
    this.setState({ addNoteDisabled: true });
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
          tags: [],
          userSummaryText: '',
          addNoteDisabled: false,
        });
      },
    );
  }

  /**
    @param {object} event
    calls updates state for summary text
    and enables addNote button if > 0
  */
  _setUserSummaryText(evt) {
    const summaryText = evt.target.value;
    this.setState({
      userSummaryText: summaryText,
      addNoteDisabled: (summaryText.length === 0),
    });
  }
  /**
    @param {number} i
    removes tag from list
  */
   _handleDelete = (i) => {
     const { tags } = this.state;

     tags.splice(i, 1);

     this.setState({ tags });
   }
   /**
     @param {number} i
     add tag to list
   */
   _handleAddition = (tag) => {
     const { tags } = this.state;

     tags.push({
       id: tags.length + 1,
       text: tag,
     });

     this.setState({ tags });
   }
   /**
     @param {number} i
     drags tag to new position.
   */
   _handleDrag = (tag, currPos, newPos) => {
     const { tags } = this.state;

     // mutate array
     tags.splice(currPos, 1);
     tags.splice(newPos, 0, tag);

     // re-render
     this.setState({ tags });
   }


   render() {
     const { tags } = this.state;
     return (
       <div className="UserNote flex flex--column">
         <input
           id="UserNoteTitle"
           placeholder="Add a summary title"
           onKeyUp={
            e => this._setUserSummaryText(e)
          }
           className="UserNote__summary"
         />

         <textarea
           ref="markdown"
           className="UserNote__summary"
           id="markDown"
         />

         <ReactTags
           id="TagsInput"
           tags={tags}
           handleDelete={(index) => { this._handleDelete(index); }}
           handleAddition={(tag) => { this._handleAddition(tag); }}
           handleDrag={(tag, currPos, newPos) => { this._handleDrag(tag, currPos, newPos); }}
         />

         <button
           className="UserNote__add-note"
           disabled={this.state.addNoteDisabled}
           onClick={() => { this._addNote(); }}
         >Add Note
         </button>
       </div>
     );
   }
}
