// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import CodeBrowser from './CodeBrowser'
import CodeFavorites from './CodeFavorites'

class Code extends Component {
  constructor(props){
  	super(props);

  }
  render(){

    if(this.props.labbook){
      return(

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Used</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">
            <CodeFavorites
              codeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
              labbookName={this.props.labbookName}
            />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Browser</h5>
            <div className="Code__toolbar">
              <p className="Code__import-text">
                <a className="Code__import-file">Import File</a>
                or Drag and Drop File Below
              </p>

            </div>
          </div>
          <div className="Code__file-browser">
            <CodeBrowser
              labbookId={this.props.labbookId}
              codeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
              labbookName={this.props.labbookName}
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
  Code,
  graphql`
    fragment Code_labbook on Labbook{
      code{
        id
        ...CodeBrowser_code
        ...CodeFavorites_code
      }
    }
  `,
);
