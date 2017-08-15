import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
import AddEnvironmentComponentMutation from './../../mutations/AddEnvironmentComponentMutation'

const AddCustomDependenciesQuery = graphql`query AddCustomDependenciesQuery($first: Int!, $cursor: String){
  availableCustomDependencies(first: $first, after: $cursor){
    edges{
      node{
        id
        component{
          id
          repository
          namespace
          name
          version
          componentClass
        }
        author{
          id
          name
          email
          username
          organization
        }
        info{
          id
          name
          humanName
          description
          versionMajor
          versionMinor
          tags
          icon
        }
        osBaseClass
        docker
      }
      cursor
    }
    pageInfo{
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}`

export default class AddCustomDependencies extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'selectedCustomDependency': null,
      'selectedCustomDependencyId': false

    };
  }
  /*
    click handle
    function(object): takes a base image edge
    sets componest state for selectedCustomDependencyId and selectedCustomDependency
  */
  _selectCustomDependency(edge){
    this.setState({'selectedCustomDependency': edge})
    this.setState({'selectedCustomDependencyId': edge.node.id})
  }

  /*
    function()
    gets current selectedCustomDependency and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  _createCustomDependency(){
    let component = this.state.selectedCustomDependency.node.component;
    AddEnvironmentComponentMutation(
      this.props.labbookName,
      'default',
      component.repository,
      component.namespace,
      component.name,
      component.version,
      "clientMutationId",
      component.componentClass,
      () => {
        this.props.setComponent(this.props.nextWindow)
      }
    )
  }

  render(){

    return(
      <div className="AddCustomDependencies">

        <p> Base Image </p>

        <QueryRenderer
          variables={{
            first: 20
          }}
          query={AddCustomDependenciesQuery}
          environment={environment}
          render={({error, props}) =>{

              if(error){

                return(<div>{error.message}</div>)
              }else{

                if(props){
                  return(
                    <div className="AddCustomDependencies__inner-container flex flex--column justify--space-between">
                      <div className="AddCustomDependencies__selected-image-container">

                          {
                            (this.state.selectedCustomDependency !== null) && (
                              <div className="AddCustomDependencies__selected-image">
                                <img alt="" src={this.state.selectedCustomDependency.node.info.icon} height="50" width="50" />
                                <p>{this.state.selectedCustomDependency.node.info.humanName}</p>
                              </div>
                            )
                          }
                      </div>

                      <div className="AddCustomDependencies__images flex flex--row flex--wrap justify--space-around">
                      {
                        props.availableCustomDependencies.edges.map((edge) => {

                            return(
                              <div className={(this.state.selectedCustomDependencyId === edge.node.id) ? 'AddCustomDependencies__image--selected': 'AddCustomDependencies__image'} onClick={()=> this._selectCustomDependency(edge)} key={edge.node.id}>
                                <img alt="" src={edge.node.info.icon} height="50" width="50" />
                                <p>{edge.node.info.humanName}</p>
                              </div>
                            )
                        })
                      }

                    </div>
                    <div className="AddCustomDependencies__progress-buttons flex flex--row justify--space-between">
                      <button className="AddCustomDependencies__progress-button flat--button">
                        Previous
                      </button>
                      <button className="AddCustomDependencies__progress-button flat--button">
                        Cancel
                      </button>
                      <button className="AddCustomDependencies__progress-button flat--button">
                        skip
                      </button>
                      <button onClick={()=> this._createCustomDependency()} disabled={(!this.state.selectedCustomDependencyId)}>Save and Continue Setup</button>
                    </div>
                  </div>
                )
                }else{
                  return(<div className="Loading"></div>)
                }
              }
          }}
        />

      </div>
      )
  }
}
