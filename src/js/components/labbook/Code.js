// import 'es6-promise';
import React, { Component } from 'react'

export default class Code extends Component {
  constructor(props){
  	super(props);
  }

  render(){

    return(
        <div id="code" className="Code flex flex-row justify-center">
          <a className="btn btn-secondary" href="http://localhost:8888/notebooks/example.ipynb"
          target="_blank">
            Open Jupyter
          </a>
        </div>
      )
  }
}
