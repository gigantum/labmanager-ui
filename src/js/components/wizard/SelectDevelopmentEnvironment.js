import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
import AddEnvironmentComponentMutation from './../../mutations/AddEnvironmentComponentMutation'

const BaseImageQuery = graphql`query SelectDevelopmentEnvironmentQuery($first: Int!, $cursor: String){
  availableDevEnvs(first: $first, after: $cursor){
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
        developmentEnvironmentClass
        installCommands
        execCommands
        exposedTcpPorts
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

export default class SelectDevelopmentEnvironment extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
      'selectedDevelopmentEnvironment': null,
      'selectedDevelopmentEnvironmentId': false
    };
  }

  /*
    click handle
    function(object): takes a development environment edge
    sets component state for selectedDevelopmentEnvironmentId and selectedDevelopmentEnvironment
  */
  _selectDevelopmentEnvironment(edge){
    this.setState({'selectedDevelopmentEnvironment': edge})
    this.setState({'selectedDevelopmentEnvironmentId': edge.node.id})
  }

  /*
    function()
    gets current selectedDevelopmentEnvironment and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  _createDevelopmentEnvironment(){

    let component = this.state.selectedDevelopmentEnvironment.node.component;

    AddEnvironmentComponentMutation(
      this.props.labbookName,
      'default',
      component.repository,
      component.namespace,
      component.name,
      component.version,
      "clientMutationId",
      component.componentClass,
      (log) => {
        this.props.setComponent(this.props.nextWindow, this.state.name)
      }
    )
  }

  render(){

    return(
      <div className="SelectBaseImage">

        <p> Dev Environment</p>
        <QueryRenderer
          variables={{
            first: 20
          }}
          query={BaseImageQuery}
          environment={environment}
          render={({error, props}) =>{
              console.log(error, props);
              if(error){
                console.log('asads')
                return(<div>{error.message}</div>)
              }else{
                if(props){
                  return(
                    <div className="SelectBaseImage__inner-container">
                      <div className="SelectBaseImage__selected-image-container">

                          {
                            (this.state.selectedDevelopmentEnvironment !== null) && (
                              <div className="SelectBaseImage__selected-image">
                                <img alt="" src={this.state.selectedDevelopmentEnvironment.node.info.icon} height="50" width="50" />
                                <p>{this.state.selectedDevelopmentEnvironment.node.info.humanName}</p>
                              </div>
                            )
                          }
                      </div>
                      <div className="SelectBaseImage__images flex flex--row flex--wrap justify--space-around">
                      {
                        props.availableDevEnvs.edges.map((edge) => {
                            console.log(edge)
                            return(
                              <div className={(this.state.selectedDevelopmentEnvironmentId === edge.node.id) ? 'SelectBaseImage__image--selected': 'SelectBaseImage__image'} onClick={()=> this._selectDevelopmentEnvironment(edge)} key={edge.node.id}>
                                <img alt="" src={'data:image/png;base64,' + edge.node.info.icon} height="50" width="50" />
                                <p>{edge.node.info.humanName}</p>
                              </div>
                            )
                        })
                      }


                      </div>
                    <button onClick={()=> this._createDevelopmentEnvironment()} disabled={(!this.state.selectedDevelopmentEnvironmentId)}>Next</button>
                  </div>                  )
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
