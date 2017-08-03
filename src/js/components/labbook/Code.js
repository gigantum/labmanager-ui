// import 'es6-promise';
import React, { Component } from 'react'

export default class Code extends Component {
  constructor(props){
  	super(props);
  }

  _openJupyter(){
    window.open('http://localhost:8888/notebooks/example.ipynb', '_blank')
  }

  render(){

    return(
        <div id="code" className="Code flex flex-row justify-center">
          <button className="" onClick={() => this._openJupyter()}
          target="_blank">
            Open Jupyter
          </button>
        </div>
      )
  }
}
