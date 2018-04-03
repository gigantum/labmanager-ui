//vendor
import { createPaginationContainer, graphql } from 'react-relay'
//component
import MostRecent from './MostRecent'
//store
import store from 'JS/redux/store'


export default createPaginationContainer(
    MostRecent,
    {
        code: graphql`
            fragment MostRecentCode_code on LabbookSection{
              allFiles(after: $cursor, first: $first)@connection(key: "MostRecentCode_allFiles"){
                edges{
                  node{
                      id
                      key
                      isDir
                      isFavorite
                      modifiedAt
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
            return props.code && props.code.allFiles
        },
        getFragmentVariables(prevVars, totalCount) {
            return {
                ...prevVars,
                first: totalCount,
            };
        },
        getVariables(props, { count, cursor }, fragmentVariables) {
            const { owner, labbookName } = store.getState().routes
            return {
                first: count,
                cursor,
                owner: owner,
                name: labbookName
            };
        },
        query: graphql`
            query MostRecentCodePaginationQuery(
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
                   ...MostRecentCode_code
                 }
              }
            }
          `
    }
)