import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
import BuildImageMutation from './../../mutations/BuildImageMutation'


export default class SelectBaseImage extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
    };
  }


  /*
    function()
    gets current selectedBaseImage and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  _completeSetup(){
    BuildImageMutation(
      this.props.labbookName,
      'default',
      (log, error) => {
        console.log(log, error)
        this.props.setComponent(this.props.nextWindow, this.state.name)
      }
    )


  }

  render(){

    return(
      <div className="ImportCode">

          <button onClick={() => this._completeSetup()}> Complete Setup </button>

      </div>
      )
  }
}
