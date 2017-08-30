import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
import AddEnvironmentComponentMutation from './../../mutations/AddEnvironmentComponentMutation'
let addCustomDependencies;
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
      'selectedCustomDependencies': [],
      'selectedCustomDependenciesIds': []
    };
    this.continueSave = this.continueSave.bind(this)
    addCustomDependencies = this;
  }
  /*
    click handle
    function(object): takes a base image edge
    sets componest state for selectedCustomDependencyId and selectedCustomDependency
  */
  _selectCustomDependency(edge){
    let selectedCustomDependencies = this.state.selectedCustomDependencies;
    let selectedCustomDependenciesIds = this.state.selectedCustomDependenciesIds;

    if(selectedCustomDependenciesIds.indexOf(edge.node.id) > -1){
        selectedCustomDependenciesIds.splice(selectedCustomDependenciesIds.indexOf(edge.node.id), 1)
        selectedCustomDependencies.splice(selectedCustomDependenciesIds.indexOf(edge.node.id), 1)
    }else{
      selectedCustomDependenciesIds.push(edge.node.id)
      selectedCustomDependencies.push(edge)
    }
    this.setState({'selectedCustomDependencies': selectedCustomDependencies})
    this.setState({'selectedCustomDependenciesIds': selectedCustomDependenciesIds})
    this.props.toggleDisabledContinue(false);
  }

  /*
    function()
    gets current selectedCustomDependency and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  continueSave(){
    let all = [];
    this.props.toggleDisabledContinue(true);
    this.state.selectedCustomDependencies.forEach((edge) => {

      let component = edge.node.component;
      let promise = new Promise((resolve, reject) => {
        AddEnvironmentComponentMutation(
          this.props.labbookName,
          'default',
          component.repository,
          component.namespace,
          component.name,
          component.version,
          "clientMutationId",
          this.props.environmentId,
          this.props.connection,
          component.componentClass,
          () => {
            resolve()
          }
        )
      })

      all.push(promise)
    });

    Promise.all(all).then(values => {

      addCustomDependencies.props.setComponent(this.props.nextWindow);
      if(this.props.buildCallback){
        addCustomDependencies.props.buildCallback();
      }
    })
  }

  _environmentView(){
    return this.props.environmentView
  }

  render(){

    return(
      <div className="AddCustomDependencies">

        <p> Select Custom Dependencies </p>

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
                            (this.state.selectedCustomDependencies.length > -1) && (
                              this.state.selectedCustomDependencies.map((customDependency, index) => {
                                return (
                                  <div key={customDependency.node.id + index} className="AddCustomDependencies__selected-image flex">
                                    <img alt="" src={customDependency.node.info.icon} height="50" width="50" />
                                    <p>{customDependency.node.info.humanName}</p>
                                  </div>
                                )
                              })
                            )
                          }
                      </div>

                      <div className="AddCustomDependencies__images flex flex--row flex--wrap justify--space-around">
                      {
                        props.availableCustomDependencies.edges.map((edge) => {

                            return(
                              <div disabled={(this.state.selectedCustomDependenciesIds.indexOf(edge.node.id) > -1)} className={(this.state.selectedCustomDependenciesIds.indexOf(edge.node.id) > -1) ? 'AddCustomDependencies__image--selected': 'AddCustomDependencies__image'} onClick={()=> this._selectCustomDependency(edge)} key={edge.node.id}>
                                <img alt="" src={edge.node.info.icon} height="50" width="50" />
                                <p>{edge.node.info.humanName}</p>
                              </div>
                            )
                        })
                      }

                    </div>
                    {
                      this._environmentView() && (
                        <div className="SelectBaseImage__progress-buttons flex flex--row justify--space-between">
                          <button onClick={() => this.continueSave()}>Save</button>
                        </div>
                      )
                    }
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
