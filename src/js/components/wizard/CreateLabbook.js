//vendor
import React from 'react'
import SweetAlert from 'sweetalert-react';
//utilities
import validation from 'JS/validation/Validation'
//mutations
import CreateLabbookMutation from 'Mutations/CreateLabbookMutation'

let createLabbook;
export default class CreateLabbook extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
      'showError': false,
      'show': false,
      'message': ''
    };

    this.handler = this.handler.bind(this)
    this.continueSave = this.continueSave.bind(this)
    this._updateTextState = this._updateTextState.bind(this)

    createLabbook = this;
  }

  handler(e) {
      e.preventDefault()
   }
   /*
    function(event) takes and event input
    creates a labbook mutation sets labbook name on parent component
    triggers setComponent to proceed to next view
   */

  continueSave(evt){
    let viewerId = 'localLabbooks';//Todo: figure out what to do with viewerId in the mutation context
    let name = this.state.name;
    //create new labbook

    CreateLabbookMutation(
      this.state.description,
      name,
      viewerId,
      (error) => {

        let showAlert = (error !== null)

        if(!showAlert){
          let message = showAlert ? error[0].message : '';
          createLabbook.setState({
            'show': showAlert,
            'message': message,
          })
        }

        this.props.setLabbookName(this.state.name)

        if(this.props.nextWindow){
          this.props.toggleDisabledContinue(true)
          this.props.setComponent(this.props.nextWindow)
        } else{

          this._hideModal();
        }

      }//route to new labbook on callback
    )
  }
  /*
    evt:object, field:string - updates text in a state object and passes object to setState method
  */
  _updateTextState(evt, field){
    let state = {}

    state[field] = evt.target.value;
    if(field === 'name'){
      let isMatch = validation.labbookName(evt.target.value)
      this.setState({
      'showError': ((isMatch === null) && (evt.target.value.length > 0))
      })

      this.props.toggleDisabledContinue((evt.target.value === "") || (isMatch === null));

    }
    this.setState(state)
  }


  render(){
    return(
      <div className="CreateLabbook">
          <div className='CreateLabbook__modal-inner-container flex flex--column justify--space-between'>

            <div>
              <label>Title</label>
              <input
                type='text'
                className={this.state.showError ? 'invalid' : ''}
                onChange={(evt) => this._updateTextState(evt, 'name')}
                placeholder="Enter a unique, descriptive title"
              />
              <span className={this.state.showError ? 'error': 'hidden'}>Error: Title may only contain alphanumeric characters separated by hyphens. (e.g. lab-book-title)</span>
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

            <SweetAlert
              className="sa-error-container"
              show={this.state.show}
              type="error"
              title="Error"
              text={this.state.message}
              onConfirm={() => {this.state.reject(); this.setState({ show: false, message: ''})}} />
          </div>
        </div>
      )
  }
}
