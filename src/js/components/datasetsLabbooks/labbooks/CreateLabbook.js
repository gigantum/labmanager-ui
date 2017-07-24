import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'

import CreateLabbookMutation from '../../../mutations/CreateLabbookMutation'

// const CreatePageViewerQuery = graphql`
//   query CreateLabbookQuery {
//     viewer {
//       id
//     }
//   }
// `;

export default class CreateLabbook extends React.Component {
  constructor(props){
  	super(props.props);
    console.log(props)
  	this.state = {'modal_visible': false};
  }
  _createLabbook(){
    let description = 'describe it';
    let name = 'tempLabbook3'// + Math.floor((Math.random()*1000));
    let viewerId = 'calum';
    console.log(this)
    //CreateLabbookMutation(description, name, viewerId,  () => this.props.history.replace(`/home`))
  }
  _showModal(){
    this.setState({'modal_visible': true})
  }
  _hideModal(){
    this.setState({'modal_visible': false})
  }
  render(){

    return(
        <div className='create-labbook__container'>
            <div className={!this.state.modal_visible ? 'create-labbook__modal hidden' : 'create-labbook__modal'}>
              <div className='create-labbook__modal-inner-container flex flex-column justify--space-around'>
                <div>
                  <label>Name</label><input type='text'></input>
                </div>
                <div>
                  <label>Description</label><input type='text'></input>
                </div>
                <div>
                  <button className='pa3 bg-black-10 bn dim ttu pointer' onClick={() => this._createLabbook()}>
                  Create Labbook</button>
                </div>
              </div>
            </div>

            <button className='pa3 bg-black-10 bn dim ttu pointer' onClick={() => this._showModal()}>Create Labbook</button>
        </div>
      )
  }
}
