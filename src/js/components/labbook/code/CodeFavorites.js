// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//componenets
import FavoriteCard from './../fileBrowser/FavoriteCard'
//mutations
//
let counter = 10;
class CodeFavorites extends Component {
  constructor(props){
  	super(props);
    this.state = {
      loading: false
    }
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    //this._loadMore() //routes query only loads 2, call loadMore

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
    let self = this

    this.setState({loading: true})

    this.props.relay.loadMore(
     3, // Fetch the next 10 feed items
     (response, error) => {

       self.setState({loading: false})

       if(error){
         console.error(error)
       }

     }
   );
  }


  render(){

    if(this.props.code && this.props.code.favorites){

      let loadingClass = (this.props.code.favorites.pageInfo.hasNextPage) ? 'Favorite__action-bar' : 'hidden'
      loadingClass = (this.state.loading) ? 'Favorite__action-bar--loading' : loadingClass
      console.log(loadingClass)
      if(this.props.code.favorites.edges.length > 0){
        let favorites = this.props.code.favorites.edges.filter((edge)=>{if(edge){return (edge.node !== undefined)}})
        return(
          <div className="Favorite">
            <div className="Favorite__list">
              {
                favorites.map((edge)=>{

                    return(
                      <div
                        key={edge.node.key}
                        className="Favorite__card-wrapper">
                        <FavoriteCard
                          labbookName={this.props.labbookName}
                          parentId={this.props.codeId}
                          section={'code'}
                          connection={"CodeFavorites_favorites"}
                          favorite={edge.node}
                        />
                      </div>)
                })
            }
            </div>

            <div className={loadingClass}>
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
  CodeFavorites,
  {

    code: graphql`
      fragment CodeFavorites_code on LabbookSection{
        favorites(after: $cursor, first: $first)@connection(key: "CodeFavorites_favorites", filters: []){
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
      return props.code && props.code.favorites
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      const username = localStorage.getItem('username')

      return {
        first: count,
        cursor,
        owner: username,
        name: props.labbookName
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
    `
  }

)
