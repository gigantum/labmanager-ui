//vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
import Base from './Base'
import PackageDependencies from './PackageDependencies'
import CustomDependencies from './CustomDependencies'
//mutations
import BuildImageMutation from 'Mutations/BuildImageMutation'
import StopContainerMutation from 'Mutations/StopContainerMutation'
//store
import store from 'JS/redux/store'

class Environment extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes

    this.state ={
      'modal_visible': false,
      'readyToBuild': false,
      'show': false,
      'message': '',
      owner,
      labbookName
    }

    this._buildCallback = this._buildCallback.bind(this)
    this._setBase = this._setBase.bind(this)
  }

  /**
  *  @param {None}
  *  callback that triggers buildImage mutation
  */
  _buildCallback = () => {
    const {labbookName, owner} = this.state
    this.props.setBuildingState(true)

    if(this.props.labbook.environment.containerStatus === "RUNNING"){

      StopContainerMutation(
        labbookName,
        owner,
        'clientMutationId',
        (error) =>{
          if(error){
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload:{
                message: `Problem stopping ${labbookName}`,
                messagesList: error
              }
            })
          }else{
            BuildImageMutation(
            labbookName,
              owner,
              false,
              (error) => {


                if(error){
                  store.dispatch({
                    type: 'ERROR_MESSAGE',
                    payload:{
                      message: `${labbookName} failed to build`,
                      messagesList: error
                    }
                  })
                }
                this.props.setBuildingState(false)
                return "finished"
              }
            )
          }
        }
      )
    }else {

      BuildImageMutation(
        labbookName,
        owner,
        false,
        (error) => {
          if(error){
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload:{
                message: `${labbookName} failed to build`,
                messagesList: error
              }
            })
          }

          this.props.setBuildingState(false)
          return "finished"
        }
      )

    }
  }

  /**
  *  @param {Obect}
  *  sets readyToBuild state to true
  */
  _setBase(base){
      this.setState({"readyToBuild": true})
  }

  render(){

    if(this.props.labbook){
      const env = this.props.labbook.environment;
      const {base} = env;
      return(
        <div className="Environment">

            <Base
              ref="base"
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              editVisible={true}
              containerStatus={this.props.containerStatus}
              setComponent={this._setComponent}
              setBase={this._setBase}
              buildCallback={this._buildCallback}
              blockClass="Environment"
              base={base}

             />

            <PackageDependencies
              ref="packageDependencies"
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              labbookId={this.props.labbook.id}
              containerStatus={this.props.containerStatus}
              setBase={this._setBase}
              setComponent={this._setComponent}
              buildCallback={this._buildCallback}
              base={base}
              blockClass="Environment"
            />

            <CustomDependencies
              ref="CustomDependencies"
              environment={this.props.labbook.environment}
              blockClass="Environment"
              buildCallback={this._buildCallback}
              editVisible={true}
              labbookId={this.props.labbook.id}
              environmentId={this.props.labbook.environment.id}
              containerStatus={this.props.containerStatus}
            />
          </div>
      )
    }else{
      return(
          <Loader />
        )
    }
  }
}

export default createFragmentContainer(
  Environment,
  graphql`fragment Environment_labbook on Labbook {
    environment{
      id
      imageStatus
      containerStatus
      base{
        developmentTools
        packageManagers
      }

      ...Base_environment
      ...PackageDependencies_environment
      ...CustomDependencies_environment
    }
  }`
)
