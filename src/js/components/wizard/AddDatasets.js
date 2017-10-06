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

  /**
    @param {}
    skips to next component triggering parent fucntion
    callback triggers and modal state is changed to  next window
  */
  _skip(){
    this.props.setComponent(this.props.nextWindow, this.state.name)
  }

  render(){

    return(
      <div className="AddDatasets flex flex--column justify--space-around">
          <p>Select a Dataset</p>

          <div className="AddDatasets__selected-items flex justify-center"></div>
          <div className="AddDatasets__selection flex justify-center"></div>


      </div>
      )
  }
}
