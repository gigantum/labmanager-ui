//vendor
import React from 'react'
import SweetAlert from 'sweetalert-react';
import { QueryRenderer, graphql } from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
//utilites
import environment from 'JS/createRelayEnvironment'
//mutations
import AddEnvironmentComponentMutation from 'Mutations/AddEnvironmentComponentMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'

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
      'selectedCustomDependenciesIds': [],
      'show': false,
      'message': '',
      'isLoading': false
    };
    this.continueSave = this.continueSave.bind(this)
    this._buildLabbook = this._buildLabbook.bind(this)
    this._selectCustomDependency = this._selectCustomDependency.bind(this)
    this._addCustomDependencies = this._addCustomDependencies.bind(this)
  }

  /**
    @param {Object} edge
    takes a base image edge
    sets componest state for selectedCustomDependencyId and selectedCustomDependency
  */
  _selectCustomDependency = (edge) => {
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

  /**
    @param {}
    triggers buildMuation
    sends user to next window
  */
  _buildLabbook = () => {

    BuildImageMutation(
      this.props.labbookName,
      'default',
      (response, error) => {
        console.log(response, error)
        let showAlert = ((error !== undefined) && (error !== null))
        if(showAlert){
          let message = showAlert ? error[0].message : '';
          this.setState({
            'isLoading': false,
            'show': showAlert,
            'message': message
          })
        }
        if(this.props.buildCallback){
          this.props.buildCallback()
        }
        this.props.setComponent(this.props.nextWindow);

      })
  }


  /**
    @param {}
    gets current selectedCustomDependency and passes variables to AddEnvironmentComponentMutation
    callback triggers build mutation
  */
  _addCustomDependencies = () => {
    let all = [];

    this.setState({
      'isLoading': true
    })

    this.props.toggleDisabledContinue(true);

    this.state.selectedCustomDependencies.forEach((edge) => {

      const {component} = edge.node;

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
          (error) => {
            console.log(error)
            let showAlert = (error)

            if(showAlert){
              let message = showAlert ? error[0].message : '';
              this.setState({
                'show': showAlert,
                'message': message,
                'reject': reject

              })

            }else{

              resolve()
            }
          }
        )
      })

      all.push(promise)
    });

    Promise.all(all).then(values => {
        this._buildLabbook();
    })
  }


  /**
    @param {boolean} isSkip
    gets current selectedCustomDependency and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  continueSave(isSkip){
    if(!isSkip){
      this._addCustomDependencies()
    }
    else{
      this._buildLabbook()
    }
  }

  /**
    @param {}
    @return {Object} environmentView object
  */
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
                    this._renderQueryResults(props)

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


  _renderQueryResults(props){
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

              let disabled = (this.state.selectedCustomDependenciesIds.indexOf(edge.node.id) > -1)

              return(
                <div
                  disabled={disabled}
                  className={disabled ? 'AddCustomDependencies__image--selected': 'AddCustomDependencies__image'}
                  onClick={()=> this._selectCustomDependency(edge)}
                  key={edge.node.id}>

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
            <button className="SelectBaseImage__save-button" onClick={() => this.continueSave()}>Save</button>
          </div>
        )
      }

      <div className={this.state.isLoading ? '' : 'hidden'}>
        <Loader />
      </div>

      <SweetAlert
        className="sa-error-container"
        show={this.state.show}
        type="error"
        title="Error"
        text={this.state.message}
        onConfirm={() => {
          this.state.reject(); this.setState({ show: false, message: ''})
        }}
        />
    </div>
    )
  }
}
