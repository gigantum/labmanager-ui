// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
// components
import CodeBrowser from './CodeBrowser';
import CodeFavorites from './CodeFavorites';
import MostRecent from 'Components/labbook/filesShared/MostRecentCode';
import ToolTip from 'Components/shared/ToolTip';

class Code extends Component {
  constructor(props) {
  	super(props);
    this.state = {
      selectedFiles: [],
      selectedFilter: 'favorites',
    };
    this._setSelectedFiles = this._setSelectedFiles.bind(this);
    this._clearSelectedFiles = this._clearSelectedFiles.bind(this);
    this._loadStatus = this._loadStatus.bind(this);
    this._selectFilter = this._selectFilter.bind(this);
  }
  componentDidUpdate() {
    this.refs[this.state.selectedFilter].classList.add('Code__filter--selected');
    for (const key in this.refs) {
      if (key !== this.state.selectedFilter) {
        this.refs[key].classList.remove('Code__filter--selected');
      }
    }
  }

  _setSelectedFiles(evt) {
    const files = [...evt.target.files];
    this.setState({ selectedFiles: files });
  }

  _clearSelectedFiles() {
    this.setState({ selectedFiles: [] });
  }

  _loadStatus(res) {
    if (res !== this.state.loadingStatus) {
      this.setState({ loadingStatus: res });
    }
  }
  _selectFilter(filterName) {
    this.setState({ selectedFilter: filterName });
  }

  render() {
    if (this.props.labbook) {
      return (

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Files <ToolTip section="codeFiles" /></h5>
            <div className="Code__toolbar">
              <a ref="favorites" className="Code__filter" onClick={() => this._selectFilter('favorites')}>Favorites</a>
              <a ref="recent" className="Code__filter" onClick={() => this._selectFilter('recent')}>Most Recent</a>
            </div>
          </div>
          <div className="Code__files">
            {
            this.state.selectedFilter === 'favorites' &&
            <CodeFavorites
              codeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
            />
          }
            {
            this.state.selectedFilter === 'recent' &&
            <MostRecent
              edgeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
            />
          }
          </div>
          <div className="Code__header">
            <div className="Code__subtitle-container">
              <h5 className="Code__subtitle">Code Browser
                <ToolTip section="codeBrowser" />
                {
                  this.state.loadingStatus &&
                  <div className="Code__loading" />
                }
              </h5>
              <p className="Code__subtitle-sub">To view and edit files, open JupyterLab. If in the "Stopped" state, click the container status button to "Run".</p>
            </div>

            <div className="Code__toolbar end">
              <p className="Code__import-text" id="Code__">
                <label
                  className="Code__import-file"
                  htmlFor="file__code"
                >
                  Upload File
                </label>
                <input
                  id="file__code"
                  className="hidden"
                  type="file"
                  onChange={(evt) => { this._setSelectedFiles(evt); }}
                />
                or Drag and Drop File Below
              </p>
            </div>
          </div>
          <div className="Code__file-browser">
            <CodeBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              labbookId={this.props.labbookId}
              codeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
              loadStatus={this._loadStatus}
              isLocked={this.props.isLocked}
            />
          </div>
        </div>
      );
    }
    return (<div>No Files Found</div>);
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
        ...MostRecentCode_code
      }
    }
  `,
);
