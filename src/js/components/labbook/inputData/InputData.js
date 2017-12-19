// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import InputDataBrowser from './InputDataBrowser'
import InputFavorites from './InputFavorites'

class InputData extends Component {
  constructor(props){
  	super(props);

  }

  render(){

    if(this.props.labbook){
      return(

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Input Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Used</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">
            <InputFavorites
              inputId={this.props.labbook.input.id}
              labbookId={this.props.labbookId}
              input={this.props.labbook.input}
              labbookName={this.props.labbookName}
              owner={this.props.owner}
            />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Input Browser</h5>
            <div className="Code__toolbar">
              <p className="Code__import-text">
                <a className="Code__import-file">Import File</a>
                or Drag and Drop File Below
              </p>

            </div>
          </div>
          <div className="Code__file-browser">
            <InputDataBrowser
              inputId={this.props.labbook.input.id}
              labbookId={this.props.labbookId}
              input={this.props.labbook.input}
              labbookName={this.props.labbookName}
              owner={this.props.owner}
            />
          </div>
        </div>
      )
    }else{
      return(<div>No Files Found</div>)
    }
  }
}



export default createFragmentContainer(
  InputData,
  graphql`
    fragment InputData_labbook on Labbook {
      input{
        id
        ...InputDataBrowser_input
        ...InputFavorites_input
      }
    }
  `,
);
