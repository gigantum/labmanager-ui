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
    console.log('sasd')
      e.preventDefault()
    //   this.setState({
    //    'value': "dsds"
    //  });
   }

  _createLabbook(evt){
    let viewerId = 'localLabbooks';//Todo: figure out what to do with viewerId in the mutation context
    let name = this.state.name;
    console.log(this);
    //create new labbook
    if(this.props.nextWindow){
      CreateLabbookMutation(
        this.state.description,
        name,
        viewerId,
        () => this.props.setComponent(this.props.nextWindow)//route to new labbook on callback
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
    console.log(this)
    return(
      <div className="CreateLabbook">
          <div className='CreateLabbook__modal-inner-container flex flex-column justify--space-around'>

            <div>
              <label>Name</label>
              <input
                type='text'
                onChange={(evt) => this._updateTextState(evt, 'name')}
              />
            </div>

            <div>
              <label>Description</label>
              <input
                type="text"
                onChange={(evt) => this._updateTextState(evt, 'description')}
              />
            </div>

            <div>
              <button
                className="CreateLabbook__button"
                onClick={(x, evt) => this._createLabbook(evt)}
              >
                Create Labbook
              </button>
            </div>
          </div>
        </div>
      )
  }
}
