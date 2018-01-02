// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//componenets
import FavoriteCard from './../fileBrowser/FavoriteCard'
//store
import store from 'JS/redux/store'

class InputFavorites extends Component {
  constructor(props){
  	super(props);
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this._loadMore() //routes query only loads 2, call loadMore

    this.props.relay.loadMore(
     1, // Fetch the next 10 feed items
     (response, error) => {
       if(error){
         console.error(error)
      }
    })
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

       if(error){
         console.error(error)
       }

     }
   );
  }


  render(){

    if(this.props.input && this.props.input.favorites){
      if(this.props.input.favorites.edges.length > 0){
        return(
          <div className="Favorite">
            <div className="Favorite__list">
              {
                this.props.input.favorites.edges.map((edge)=>{
                    return(
                      <div
                        key={edge.node.key}
                        className="Favorite__card-wrapper">

                        <FavoriteCard
                          parentId={this.props.inputId}
                          section={'input'}
                          connection={"InputFavorites_favorites"}
                          favorite={edge.node}
                        />
                      </div>)
                })
            }
            </div>

            <div className={this.props.input.favorites.pageInfo.hasNextPage ? "Favorite__action-bar" : "hidden"}>
              <button
                className="Favorite__load-more"
                onClick={()=>{this._loadMore()}}
              >
                Load More
              </button>
            </div>
        </div>
        )
      }else{
        return(
          <div> No Files Favorited</div>
        )
      }
    }else{
      return(<div>No Files Found</div>)
    }
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
              isDir
              description
              key
              index
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

      }`
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.input && props.input.favorites
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {

      let root = ""
      const {owner, labbookName} = store.getState().routes
      return {
        first: count,
        cursor,
        root,
        owner: owner,
        name: labbookName
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
    `
  }

)
