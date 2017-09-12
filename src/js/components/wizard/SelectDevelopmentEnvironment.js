//vendor
import React from 'react'
import SweetAlert from 'sweetalert-react'
import { QueryRenderer, graphql } from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
//utilites
import environment from 'JS/createRelayEnvironment'
//mutations
import AddEnvironmentComponentMutation from 'Mutations/AddEnvironmentComponentMutation'

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
      'selectedDevelopmentEnvironmentId': false,
      'show': false,
      'message': ''
    };
    this.continueSave = this.continueSave.bind(this);
  }

  /*
    click handle
    function(object): takes a development environment edge
    sets component state for selectedDevelopmentEnvironmentId and selectedDevelopmentEnvironment
  */
  _selectDevelopmentEnvironment(edge){
    this.setState({'selectedDevelopmentEnvironment': edge})
    this.setState({'selectedDevelopmentEnvironmentId': edge.node.id})
    this.props.toggleDisabledContinue(false);
  }

  /*
    function()
    gets current selectedDevelopmentEnvironment and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  continueSave(){

    let component = this.state.selectedDevelopmentEnvironment.node.component;
    this.props.toggleDisabledContinue(true);
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
      (log) => {
        this.props.setComponent(this.props.nextWindow, this.state.name)
        this.props.buildCallback()
      }
    )
  }

  _environmentView() {
    return this.props.environmentView;
  }

  render(){

    return(
      <div className="SelectDevelopmentEnvironment">

        <p> Dev Environment</p>
        <QueryRenderer
          variables={{
            first: 20
          }}
          query={BaseImageQuery}
          environment={environment}
          render={({error, props}) =>{

              if(error){
                console.error(error)
                return(<div>{error.message}</div>)
              }else{
                if(props){
                  return(
                    <div className="SelectDevelopmentEnvironment__inner-container flex flex--column justify--space-between">
                      <div className="SelectDevelopmentEnvironment__selected-image-container">

                          {
                            (this.state.selectedDevelopmentEnvironment !== null) && (
                              <div className="SelectDevelopmentEnvironment__selected-image">
                                <img alt="" src={this.state.selectedDevelopmentEnvironment.node.info.icon} height="50" width="50" />
                                <p>{this.state.selectedDevelopmentEnvironment.node.info.humanName}</p>
                              </div>
                            )
                          }
                      </div>
                      <div className="SelectDevelopmentEnvironment__images flex flex--row flex--wrap justify--space-around">
                      {
                        props.availableDevEnvs.edges.map((edge) => {

                            return(
                              <div className={(this.state.selectedDevelopmentEnvironmentId === edge.node.id) ? 'SelectDevelopmentEnvironment__image--selected': 'SelectDevelopmentEnvironment__image'} onClick={()=> this._selectDevelopmentEnvironment(edge)} key={edge.node.id}>
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
                  <SweetAlert
                      className="sa-error-container"
                      show={this.state.show}
                      type="error"
                      title="Error"
                      text={this.state.message}
                      onConfirm={() => {this.state.reject(); this.setState({ show: false, message: ''})}} />
                </div>

                )

                }else{
                  return(<Loader />)
                }
              }
          }}
        />

      </div>
      )
  }
}
