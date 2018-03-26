//vendor
import { createPaginationContainer, graphql } from 'react-relay'
//component
import MostRecent from './MostRecent'
//store
import store from 'JS/redux/store'

export default createPaginationContainer(
    MostRecent,
    {
        output: graphql`
        fragment MostRecentOutput_output on LabbookSection{
            allFiles(after: $cursor, first: $first)@connection(key: "MostRecentOutput_allFiles"){
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
            return props.output && props.output.allFiles
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
        query MostRecentOutputPaginationQuery(
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
                ...MostRecentOutput_output
                }
            }
        }
        `
    }
)