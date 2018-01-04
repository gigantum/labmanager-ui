//vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
import BaseImage from './BaseImage'
import DevEnvironments from './DevEnvironments'
import PackageManagerDependencies from './PackageManagerDependencies'
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
    this._setBaseImage = this._setBaseImage.bind(this)
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

            BuildImageMutation(
            labbookName,
              owner,
              (error) => {

                let showAlert = ((error !== null) && (error !== undefined))
                let message = showAlert ? error[0].message : '';

                if(showAlert){
                  store.dispatch({
                    type: 'UPLOAD_MESSAGE',
                    payload:{
                      error: true,
                      message: error[0].message
                    }
                  })
                }
                this.props.setBuildingState(false)
                return "finished"
              }
            )
          }
      )
    }else {

      BuildImageMutation(
        labbookName,
        owner,
        (error) => {

          let showAlert = ((error !== null) && (error !== undefined))
          let message = showAlert ? error[0].message : '';

          if(showAlert){
            store.dispatch({
              type: 'UPLOAD_MESSAGE',
              payload:{
                error: true,
                message: error[0].message
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
  _setBaseImage(baseImage){
      this.setState({"readyToBuild": true})
  }

  render(){
    if(this.props.labbook){
      const env = this.props.labbook.environment;
      const {baseImage} = env;

      return(
        <div className="Environment">

            <BaseImage
              ref="baseImage"
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              editVisible={true}
              containerStatus={this.props.containerStatus}
              setComponent={this._setComponent}
              setBaseImage={this._setBaseImage}
              buildCallback={this._buildCallback}
              blockClass="Environment"
              baseImage={baseImage}

             />

            <DevEnvironments
              ref="devEnvironments"
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              containerStatus={this.props.containerStatus}
              editVisible={true}
              buildCallback={this._buildCallback}
              blockClass="Environment"
            />

            <PackageManagerDependencies
              ref="packageManagerDependencies"
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              containerStatus={this.props.containerStatus}
              setBaseImage={this._setBaseImage}
              setComponent={this._setComponent}
              buildCallback={this._buildCallback}
              baseImage={baseImage}
              blockClass="Environment"
            />

            <CustomDependencies
              ref="CustomDependencies"
              environment={this.props.labbook.environment}
              blockClass="Environment"
              buildCallback={this._buildCallback}
              editVisible={true}
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
      baseImage{
        availablePackageManagers
      }

      ...BaseImage_environment
      ...DevEnvironments_environment
      ...PackageManagerDependencies_environment
      ...CustomDependencies_environment
    }
  }`
)
