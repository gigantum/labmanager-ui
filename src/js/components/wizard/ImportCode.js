import React from 'react'
import SweetAlert from 'sweetalert-react';

import BuildImageMutation from 'Mutations/BuildImageMutation'


export default class SelectBaseImage extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'isLoading': false,
      'name': '',
      'description': '',
    };

    this.continueSave = this.continueSave.bind(this)
    this.props.toggleDisabledContinue(false);
  }


  /*
    function()
    runs buildImageMutation and triggers setComponent to proceed to next window
  */
  continueSave(){
    this.setState({'isLoading':true})
    BuildImageMutation(
      this.props.labbookName,
      'default',
      (error) => {
        console.log(error)
        let showAlert = (error !== null)
        let message = showAlert ? error[0].message : '';
        this.setState({
          'isLoading': false,
          'show': showAlert,
          'message': message
        })

        this.props.setComponent(this.props.nextWindow, this.state.name)
      }
    )


  }

  render(){

    return(
      <div className="ImportCode flex flex--column justify-center">
        <textarea className="ImportCode__drop" placeholder="Drag and Drop code here"></textarea>

        <div className={!this.state.isLoading ? 'ImportCode__loading visibility-hidden' : 'ImportCode__loading'}>

          <div className="loader">
          	<div className="loader--ball loader--1">
          		<div className="loader--inner-ball"></div>
          	</div>
          	<div className="loader--ball loader--2">
          		<div className="loader--inner-ball"></div>
          	</div>
          	<div className="loader--ball loader--3">
          		<div className="loader--inner-ball"></div>
          	</div>
          	<div className="loader--ball loader--4">
          		<div className="loader--inner-ball"></div>
          	</div>
          	<div className="loader--ball loader--5">
          		<div className="loader--inner-ball"></div>
          	</div>
          </div>
        </div>
        <SweetAlert
          show={this.state.show}
          title="Demo"
          text={this.state.message}
          onConfirm={() => this.setState({ show: false })} />
        {/* <button disabled={this.state.isLoading} onClick={() => this._completeSetup()}> Complete Setup </button> */}
      </div>
      )
  }
}
