// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import OutputDataBrowser from './OutputDataBrowser'
import OutputFavorites from './OutputFavorites'

class OutputData extends Component {
  constructor(props){
  	super(props);
  }

  render(){

    if(this.props.labbook){

      return(

        <div className="Code">
          {
            this.props.labbook.output.isUntracked &&
            <div className="Code__tracked-container">
              <div className="Code__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          <div className="Code__header">
            <h5 className="Code__subtitle">Output Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Used</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">
            <OutputFavorites
              outputId={this.props.labbook.output.id}
              labbookId={this.props.labbookId}
              output={this.props.labbook.output}
            />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Output Browser</h5>
            <div className="Code__toolbar">
              <p className="Code__import-text">
                <a className="Code__import-file">Import File</a>
                or Drag and Drop File Below
              </p>

            </div>
          </div>
          <div className="Code__file-browser">
            <OutputDataBrowser
              outputId={this.props.labbook.output.id}
              labbookId={this.props.labbookId}
              labbook={this.props.labbook}
              output={this.props.labbook.output}
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
  OutputData,
  graphql`
    fragment OutputData_labbook on Labbook {
      output{
        id
        ...OutputDataBrowser_output
        ...OutputFavorites_output
        isUntracked
      }
    }
  `,
);
