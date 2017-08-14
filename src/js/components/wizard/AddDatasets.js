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
    skips to next component triggering parent fucntion
    callback triggers and modal state is changed to  next window
  */
  _skip(){
    this.props.setComponent(this.props.nextWindow, this.state.name)
  }

  render(){

    return(
      <div className="AddDatasets flex justify-center">

          <button onClick={() => this._skip()}> Skip </button>

      </div>
      )
  }
}
