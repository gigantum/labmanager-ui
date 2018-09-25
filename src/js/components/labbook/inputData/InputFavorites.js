// vendor
import React, { Component } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';

// componenets
import InputFavoriteList from './InputFavoriteList';
import FileEmpty from 'Components/labbook/overview/FileEmpty';

// store
import store from 'JS/redux/store';


class InputFavorites extends Component {
  /*
    update component when props are reloaded
  */
  UNSAFE_componentWillReceiveProps(nextProps) {
    // this._loadMore() //routes query only loads 2, call loadMore
    if (nextProps.input && nextProps.input.favorites && nextProps.input.favorites.pageInfo.hasNextPage && nextProps.input.favorites.edges.length < 3) {
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
    if (this.props.input && this.props.input.favorites && this.props.input.favorites.pageInfo.hasNextPage && this.props.input.favorites.edges.length < 3) {
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
    increments by 10
    logs callback
  */
  _loadMore() {
    this.props.relay.loadMore(
      3, // Fetch the next 10 feed items
      (response, error) => {
        if (error) {
          console.error(error);
        }
      },
    );
  }


  render() {
    if (this.props.input && this.props.input.favorites) {
      if (this.props.input.favorites.edges.length > 0) {
        const favorites = this.props.input.favorites.edges.filter(edge => edge && (edge.node !== undefined));
        return (
          <div className="Favorite">
            <InputFavoriteList
              labbookName={this.props.labbookName}
              inputId={this.props.inputId}
              section="input"
              favorites={favorites}
              owner={this.props.owner}
            />

            <div className={this.props.input.favorites.pageInfo.hasNextPage ? 'Favorite__action-bar' : 'hidden'}>
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
          section="inputData"
          mainText="This Project has No Input Favorites"
        />
      );
    }
    return (<div>No Files Found</div>);
  }
}

export default createPaginationContainer(
  InputFavorites,
  {

    input: graphql`
      fragment InputFavorites_input on LabbookSection{
        favorites(after: $cursor, first: $first)@connection(key: "InputFavorites_favorites", filters: []){
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
      return props.input && props.input.favorites;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      const root = '';
      const { owner, labbookName } = store.getState().routes;
      return {
        first: count,
        cursor,
        root,
        owner,
        name: labbookName,
      };
    },
    query: graphql`
      query InputFavoritesPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
           # You could reference the fragment defined previously.
           input{
             ...InputFavorites_input
           }
        }
      }
    `,
  },

);
