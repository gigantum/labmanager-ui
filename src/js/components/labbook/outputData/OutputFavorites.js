// vendor
import React, { Component } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
// componenets
import OutputFavoriteList from './OutputFavoriteList';
import FileEmpty from 'Components/labbook/overview/FileEmpty';

// store
import store from 'JS/redux/store';

class OutputFavorites extends Component {
  /*
    update component when props are reloaded
  */
  UNSAFE_componentWillReceiveProps(nextProps) {
    // this._loadMore() //routes query only loads 2, call loadMore
    if (nextProps.output && nextProps.output.favorites && nextProps.output.favorites.pageInfo.hasNextPage && nextProps.output.favorites.edges.length < 3) {
      this.props.relay.loadMore(
        1, // Fetch the next 10 feed items
        (response, error) => {
          if (error) {
            console.error(error);
          }
        },
      );
    }
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    // this._loadMore() //routes query only loads 2, call loadMore
    if (this.props.output && this.props.output.favorites && this.props.output.favorites.pageInfo.hasNextPage && this.props.output.favorites.edges.length < 3) {
      this.props.relay.loadMore(
        1, // Fetch the next 10 feed items
        (response, error) => {
          if (error) {
            console.error(error);
          }
        },
      );
    }
  }

  /*
    @param
    triggers relay pagination function loadMore
    increments by 3
    logs callback
  */
  _loadMore() {
    this.props.relay.loadMore(
      3, // Fetch the next 3 feed items
      (response, error) => {
        if (error) {
          console.error(error);
        }
      },
    );
  }


  render() {
    if (this.props.output && this.props.output.favorites) {
      if (this.props.output.favorites.edges.length > 0) {
        const favorites = this.props.output.favorites.edges.filter(edge => edge && (edge.node !== undefined));
        return (
          <div className="Favorite">
            <OutputFavoriteList
              labbookName={this.props.labbookName}
              outputId={this.props.outputId}
              section="output"
              favorites={favorites}
              owner={this.props.owner}
            />

            <div className={this.props.output.favorites.pageInfo.hasNextPage ? 'Favorite__action-bar' : 'hidden'}>
              <button
                className="Favorite__load-more"
                onClick={() => { this._loadMore(); }}
              >
                Load More
              </button>
            </div>
          </div>
        );
      }
      return (
        <FileEmpty
          section="outputData"
          mainText="This Project has No Output Favorites"
        />
      );
    }
    return (<div>No Files Found</div>);
  }
}

export default createPaginationContainer(
  OutputFavorites,
  {

    output: graphql`
      fragment OutputFavorites_output on LabbookSection{
        favorites(after: $cursor, first: $first)@connection(key: "OutputFavorites_favorites", filters: []){
          edges{
            node{
              id
              owner
              name
              index
              key
              description
              isDir
              associatedLabbookFileId
              section
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
      return props.output && props.output.favorites;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      const { owner, labbookName } = store.getState().routes;
      const root = '';

      return {
        first: count,
        cursor,
        root,
        owner,
        name: labbookName,
      };
    },
    query: graphql`
      query OutputFavoritesPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
           # You could reference the fragment defined previously.
           output{
             ...OutputFavorites_output
           }
        }
      }
    `,
  },

);
