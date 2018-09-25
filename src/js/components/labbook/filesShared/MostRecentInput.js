// vendor
import { createPaginationContainer, graphql } from 'react-relay';
// component
import MostRecent from './MostRecent';
// store
import store from 'JS/redux/store';


export default createPaginationContainer(
  MostRecent,
  {
    input: graphql`
        fragment MostRecentInput_input on LabbookSection{
            allFiles(after: $cursor, first: $first)@connection(key: "MostRecentInput_allFiles"){
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
      return props.input && props.input.allFiles;
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
        query MostRecentInputPaginationQuery(
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
                ...MostRecentInput_input
                }
            }
        }
        `,
  },
);
