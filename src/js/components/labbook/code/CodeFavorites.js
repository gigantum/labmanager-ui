// vendor
import React, { Component } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
// componenets
import CodeFavoriteList from './CodeFavoriteList';
import FileEmpty from 'Components/labbook/overview/FileEmpty';
// store
import store from 'JS/redux/store';

class CodeFavorites extends Component {
  constructor(props) {
  	super(props);
    this.state = {
      loading: false,
    };
  }
  /*
    update component when props are reloaded
  */
  UNSAFE_componentWillReceiveProps(nextProps) {
    // this._loadMore() //routes query only loads 2, call loadMore
    if (nextProps.code && nextProps.code.favorites && nextProps.code.favorites.pageInfo.hasNextPage && nextProps.code.favorites.edges.length < 3) {
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

  /**
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    // this._loadMore() //routes query only loads 2, call loadMore
    if (this.props.code && this.props.code.favorites && this.props.code.favorites.pageInfo.hasNextPage && this.props.code.favorites.edges.length < 3) {
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

  /**
    @param
    triggers relay pagination function loadMore
    increments by 10
    logs callback
  */
  _loadMore() {
    const self = this;

    this.setState({ loading: true });

    this.props.relay.loadMore(
      3, // Fetch the next 10 feed items
      (response, error) => {
        self.setState({ loading: false });

        if (error) {
          console.error(error);
        }
      },
    );
  }


  render() {
    if (this.props.code && this.props.code.favorites) {
      let loadingClass = (this.props.code.favorites.pageInfo.hasNextPage) ? 'Favorite__action-bar' : 'hidden';
      loadingClass = (this.state.loading) ? 'Favorite__action-bar--loading' : loadingClass;

      if (this.props.code.favorites.edges.length > 0) {
        const favorites = this.props.code.favorites.edges.filter(edge => edge && (edge.node !== undefined));

        return (

          <div className="Favorite">
            <CodeFavoriteList
              labbookName={this.props.labbookName}
              codeId={this.props.codeId}
              section="code"
              favorites={favorites}
              owner={this.props.owner}
            />


            <div className={loadingClass}>
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
          section="code"
          mainText="This Project has No Code Favorites"
        />
      );
    }
    return (<div>No Files Found</div>);
  }
}

export default createPaginationContainer(
  CodeFavorites,
  {

    code: graphql`
      fragment CodeFavorites_code on LabbookSection{
        favorites(after: $cursor, first: $first)@connection(key: "CodeFavorites_favorites"){
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
      return props.code && props.code.favorites;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
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
      query CodeFavoritesPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
           # You could reference the fragment defined previously.
           code{
             ...CodeFavorites_code
           }
        }
      }
    `,
  },

);
