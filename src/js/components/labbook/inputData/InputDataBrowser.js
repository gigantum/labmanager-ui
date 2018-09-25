// vendor
import React, { Component } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
// mutations
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper';
// store
import store from 'JS/redux/store';

class InputDataBrowser extends Component {
  constructor(props) {
  	super(props);

    const { owner, labbookName } = store.getState().routes;

    this.state = {
      show: false,
      message: '',
      files: [],
      moreLoading: false,
      owner,
      labbookName,
    };
  }

  /*
    loads more if branches are switched
  */
  componentDidUpdate() {
    this.props.loadStatus(this.state.moreLoading);
    if (!this.state.moreLoading && this.props.input.allFiles && this.props.input.allFiles.edges.length < 3 && this.props.input.allFiles.pageInfo.hasNextPage) {
      this._loadMore();
    }
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this.props.loadStatus(this.state.moreLoading);
    if (this.props.input.allFiles &&
      this.props.input.allFiles.pageInfo.hasNextPage) {
      this._loadMore();
    } else {
      this.setState({ moreLoading: false });
    }
  }

  /*
    @param
    triggers relay pagination function loadMore
    increments by 100
    logs callback
  */

  _loadMore() {
    // this.setState({'moreLoading': true});
    const self = this;
    this.props.relay.loadMore(
      100, // Fetch the next 100 feed items
      (response, error) => {
        if (error) {
          console.error(error);
        }

        if (self.props.input.allFiles &&
         self.props.input.allFiles.pageInfo.hasNextPage) {
          self._loadMore();
        } else {
          this.setState({ moreLoading: false });
        }
      },
    );
  }

  render() {
    if (this.props.input && this.props.input.allFiles) {
      let inputFiles = this.props.input.allFiles;
      if (this.props.input.allFiles.edges.length === 0) {
        inputFiles = {
          edges: [],
          pageInfo: this.props.input.allFiles.pageInfo,
        };
      }

      return (
        <FileBrowserWrapper
          ref="inputBrowser"
          section="input"
          files={inputFiles}
          selectedFiles={this.props.selectedFiles}
          clearSelectedFiles={this.props.clearSelectedFiles}
          connection="InputDataBrowser_allFiles"
          parentId={this.props.inputId}
          favoriteConnection="InputFavorites_favorites"
          owner={this.state.owner}
          isLocked={this.props.isLocked}
          {...this.props}
        />
      );
    }
    return (<div>No Files Found</div>);
  }
}


export default createPaginationContainer(
  InputDataBrowser,
  {

    input: graphql`
      fragment InputDataBrowser_input on LabbookSection{
        allFiles(after: $cursor, first: $first)@connection(key: "InputDataBrowser_allFiles", filters: []){
          edges{
            node{
              id
              isDir
              isFavorite
              modifiedAt
              key
              size
            }
            cursor
          }
          pageInfo{
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }

      }`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.input && props.input.allFiles;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      const { owner, labbookName } = store.getState().routes;

      return {
        first: count,
        cursor,
        owner,
        name: labbookName,
      };
    },
    query: graphql`
      query InputDataBrowserPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
          input{
            # You could reference the fragment defined previously.
            ...InputDataBrowser_input
          }
        }
      }
    `,
  },
);
