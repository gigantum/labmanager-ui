// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
// components
import OutputDataBrowser from './OutputDataBrowser';
import OutputFavorites from './OutputFavorites';
import MostRecent from 'Components/labbook/filesShared/MostRecentOutput';
import ToolTip from 'Components/shared/ToolTip';

class OutputData extends Component {
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
          {
            this.props.labbook.output.isUntracked &&
            <div className="Code__tracked-container">
              <div className="Code__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          <div className="Code__header">
            <h5 className="Code__subtitle">Output Files  <ToolTip section="outputDataFiles" /></h5>
            <div className="Code__toolbar">
              <a ref="favorites" className="Code__filter" onClick={() => this._selectFilter('favorites')}>Favorites</a>
              <a ref="recent" className="Code__filter" onClick={() => this._selectFilter('recent')}>Most Recent</a>
            </div>
          </div>
          <div className="Code__files">
            {
            this.state.selectedFilter === 'favorites' &&
            <OutputFavorites
              outputId={this.props.labbook.output.id}
              labbookId={this.props.labbookId}
              output={this.props.labbook.output}
            />
          }
            {
            this.state.selectedFilter === 'recent' &&
            <MostRecent
              edgeId={this.props.labbook.output.id}
              output={this.props.labbook.output}
            />
          }
          </div>
          <div className="Code__header">
            <div className="Code__subtitle-container">
              <h5 className="Code__subtitle">Output Browser
                <ToolTip section="outputDataBrowser" />
                {
                this.state.loadingStatus &&
                <div className="Code__loading" />
              }
              </h5>
              <p className="Code__subtitle-sub">Currently only files under 1.8GB are supported.</p>
            </div>
            <div className="Code__toolbar end">
              <p className="Code__import-text" id="Code__">
                <label
                  className="Code__import-file"
                  htmlFor="file__output"
                >
                  Upload File
                </label>
                <input
                  id="file__output"
                  className="hidden"
                  type="file"
                  onChange={(evt) => { this._setSelectedFiles(evt); }}
                />
                or Drag and Drop File Below
              </p>
            </div>
          </div>
          <div className="Code__file-browser">
            <OutputDataBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              outputId={this.props.labbook.output.id}
              labbookId={this.props.labbookId}
              output={this.props.labbook.output}
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
  OutputData,
  graphql`
    fragment OutputData_labbook on Labbook {
      output{
        id
        ...OutputDataBrowser_output
        ...OutputFavorites_output
        ...MostRecentOutput_output
        isUntracked
      }
    }
  `,
);
