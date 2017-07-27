import React, { Component } from 'react'
import {
  createFragmentContainer,
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../../createRelayEnvironment'
import CreateLabbook from './CreateLabbook'

const LabbookQuery = graphql`query LabbookSetsQuery($first: Int!){
  localLabbooks(first:$first){
    edges{
      node{
        name
        description
      }
    }
  }
}`

class LabbookSets extends Component {
  constructor(props){

    super(props)

    this.handler = this.handler.bind(this)

  }

  handler(e) {
    e.preventDefault()
     this.setState({
       'value': "dsds"
     })
  }

  goToLabbook(labbookName){
    this.props.history.replace(`/labbook/${labbookName}`)
  }

  render(){
    console.log(this.props)
    console.log('ListPage - render - environment', this.props.relay.environment)
    return(
      <div className='labbooks__container'>

        <QueryRenderer
          environment={environment}
          query={LabbookQuery}
          variables={{
            first: 20
          }}
          render={({error, props}) => {
            console.log(error, props)
            if (error) {
              return <div>{error.message}</div>
            } else if (props) {
              return (<div>
                <CreateLabbook handler={this.handler}  history={this.props.history}/>
                <div className='labbooks__container flex flex--row flex--wrap justify--space-around'>
                  {
                    props.localLabbooks.edges.map((edge) => {
                      return (<div onClick={() => this.goToLabbook(edge.node.name)} className='labbook__panel'>{edge.node.name}</div>)
                    })
                  }
                </div>
              </div>)
            }
            return <div><CreateLabbook handler={this.handler} history={this.props.history}/></div>
          }}
        />
        {/* <div className='w-100' style={{ maxWidth: 400 }}>
          {this.props.viewer.allPosts.edges.map(({node}) =>
            <div key={node.name} post={node} viewer={this.props.viewer}>node.name</div>
          )}
        </div> */}
      </div>
    )
  }
}

export default createFragmentContainer(LabbookSets, graphql`
fragment LabbookSets_viewer on Query {
  localLabbooks(first: 20) @connection(key: "LabbookSets_localLabbooks", filters: []) {
   edges {
     node {
       description
       name
     }
   }
 }
}`)
