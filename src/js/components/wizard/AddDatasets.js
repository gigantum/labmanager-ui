import React from 'react'


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
  _skip(){
    this.props.setComponent(this.props.nextWindow, this.state.name)
  }

  render(){

    return(
      <div className="AddDatasets">

          <button onClick={() => this._skip()}> Skip </button>

      </div>
      )
  }
}
