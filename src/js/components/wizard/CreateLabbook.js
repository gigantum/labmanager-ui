import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'

import CreateLabbookMutation from './../../mutations/CreateLabbookMutation'

// const CreatePageViewerQuery = graphql`
//   query CreateLabbookQuery {
//     viewer {
//       id
//     }
//   }
// `;

export default class CreateLabbook extends React.Component {
  constructor(props){
  	super(props);

    let that = this;
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': ''
    };

    this.handler = this.handler.bind(this)
  }

  handler(e) {
      e.preventDefault()
   }
   /*
    function(event) takes and event input
    creates a labbook mutation sets labbook name on parent component
    triggers setComponent to proceed to next view
   */

  _createLabbook(evt){
    let viewerId = 'localLabbooks';//Todo: figure out what to do with viewerId in the mutation context
    let name = this.state.name;
    //create new labbook
    if(this.props.nextWindow){
      CreateLabbookMutation(
        this.state.description,
        name,
        viewerId,
        () => {
          this.props.setLabbookName(this.state.name)
          this.props.setComponent(this.props.nextWindow)
        }//route to new labbook on callback
      )
      //this.props.handler(evt);
    }else{
      CreateLabbookMutation(
        this.state.description,
        name,
        viewerId,
        () => this.props.history.replace(`/labbooks/${name}`) //route to new labbook on callback
      )

      this._hideModal();
      this.props.handler(evt);
    }
  }
  /*
    evt:object, field:string - updates text in a state object and passes object to setState method
  */
  _updateTextState(evt, field){
    let state = {}
    state[field] = evt.target.value;
    this.setState(state)
  }


  render(){
    return(
      <div className="CreateLabbook">
          <div className='CreateLabbook__modal-inner-container flex flex-column justify--space-between'>

            <div>
              <label>Title</label>
              <input
                type='text'
                onChange={(evt) => this._updateTextState(evt, 'name')}
                placeholder="Enter a unique, descriptive title"
              />
            </div>

            <div>
              <label>Description</label>
              <textarea className="CreateLabbook__description-input"
                type="text"
                onChange={(evt) => this._updateTextState(evt, 'description')}

                placeholder="Briefly describe this lab book, its purpose and any other key details. "
              />
            </div>
            <div className="CreateLabbook__text-divider-container">
              <span className="CreateLabbook__text-divider">or</span>
            </div>
            <div>
              <label>Add public Lab Books</label>
              <input
                type='text'
                placeholder="Enter URL Location"
              />
            </div>

            <div className="CreateLabbook__buttons-container">
              <button
                className="CreateLabbook__button"
                onClick={(x, evt) => this._createLabbook(evt)}
              >
                Save and Continue Setup
              </button>
            </div>

          </div>
        </div>
      )
  }
}
