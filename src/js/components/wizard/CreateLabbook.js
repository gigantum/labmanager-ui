//vendor
import React from 'react'
import SweetAlert from 'sweetalert-react';
//utilities
import validation from 'JS/validation/Validation'
//mutations
import CreateLabbookMutation from 'Mutations/CreateLabbookMutation'

export default class CreateLabbook extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
      'showError': false
    };

    this.handler = this.handler.bind(this)
    this.continueSave = this.continueSave.bind(this)
    this._updateTextState = this._updateTextState.bind(this)
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

    if(this.props.nextWindow){

      this.props.toggleDisabledContinue(true);
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


          </div>
        </div>
      )
  }
}
