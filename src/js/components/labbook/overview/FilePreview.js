// vendor
import React, { Component } from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay';
import { Link } from 'react-router-dom';
// components
import Loader from 'Components/shared/Loader';
import FileCard from './FileCard';
import FileEmpty from './FileEmpty';
import ToolTip from 'Components/shared/ToolTip';
// utilites
import environment from 'JS/createRelayEnvironment';
// store
import store from 'JS/redux/store';
// assets
import './FilePreview.scss';

const filePreviewQuery = graphql`query FilePreviewQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    code{
      favorites(first: $first){
        edges{
          node{
            id
            owner
            name
            section
            key
            description
            isDir
          }
        }
      }
    }
    input{
      favorites(first: $first){
        edges{
          node{
            id
            owner
            name
            section
            key
            description
            isDir
          }
        }
      }
    }
    output{
      favorites(first: $first){
        edges{
          node{
            id
            owner
            name
            section
            key
            description
            isDir
          }
        }
      }
    }
  }
}
`;

export default class FilePreview extends Component {
  render() {
    const { owner, labbookName } = store.getState().routes;
    return (
      <QueryRenderer
        variables={{
        name: labbookName,
        owner,
        first: 3,
      }}
        query={filePreviewQuery}
        environment={environment}
        render={({ error, props }) => {
        if (props) {
          return (
            <div className="FilePreview">
              <div className="FilePreview__section">
                <div className="FilePreview__container">
                  <h5>Code &nbsp;&nbsp; <ToolTip section="codeOverview" /></h5>
                  <Link
                    onClick={this.props.scrollToTop}
                    to={{ pathname: `../../../../projects/${owner}/${labbookName}/code` }}
                    replace
                  >
                    Code Details >
                  </Link>
                </div>
                <p>Favorite Code Files</p>
                <div className="FilePreview__list grid">
                  {
                    props.labbook.code.favorites && props.labbook.code.favorites.edges.length ?
                    props.labbook.code.favorites.edges.map(edge => <FileCard key={edge.node.id} edge={edge} />) :
                    <FileEmpty
                      section="code"
                      mainText="This Project has No Code Favorites"
                      subText="View Project Code Details"
                    />
                  }
                </div>

              </div>
              <div className="FilePreview__section">
                <div className="FilePreview__container">
                  <h5>Input Data<ToolTip section="inputDataOverview" /></h5>
                  <Link
                    onClick={this.props.scrollToTop}
                    to={{ pathname: `../../../../projects/${owner}/${labbookName}/inputData` }}
                    replace
                  >
                    Input Data Details >
                  </Link>
                </div>
                <p>Favorite Input Files</p>
                <div className="FilePreview__list grid">
                  {
                    props.labbook.input.favorites &&
                    props.labbook.input.favorites.edges.length ? props.labbook.input.favorites.edges.map(edge => <FileCard key={edge.node.id} edge={edge} />) :
                    <FileEmpty
                      section="inputData"
                      mainText="This Project has No Input Favorites"
                      subText="View Project Input Data Details"
                    />
                  }
                </div>
              </div>
              <div className="FilePreview__section">
                <div className="FilePreview__container">
                  <h5>Output Data<ToolTip section="outputDataOverview" /></h5>
                  <Link
                    onClick={this.props.scrollToTop}
                    to={{ pathname: `../../../../projects/${owner}/${labbookName}/outputData` }}
                    replace
                  >
                    Output Data Details >
                  </Link>
                </div>
                <p>Favorite Output Files</p>
                <div className="FilePreview__list grid">
                  {
                    props.labbook.output.favorites &&
                    props.labbook.output.favorites.edges.length ? props.labbook.output.favorites.edges.map(edge => <FileCard key={edge.node.id} edge={edge} />) :
                    <FileEmpty
                      section="outputData"
                      mainText="This Project has No Output Favorites"
                      subText="View Project Output Data Details"
                    />
                  }
                </div>
              </div>
            </div>
          );
        } else if (error) {
          return (<div>{error.message}</div>);
        }
          return (<Loader />);
      }}
      />);
  }
}
