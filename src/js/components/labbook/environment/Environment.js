//vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react';
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

class Environment extends Component {
  constructor(props){
  	super(props);

    this.state ={
      'modal_visible': false,
      'readyToBuild': false,
      'show': false,
      'message': ''
    }

    this._buildCallback = this._buildCallback.bind(this)
    this._setBaseImage = this._setBaseImage.bind(this)
  }

  /**
  *  @param {None}
  *  callback that triggers buildImage mutation
  */
  _buildCallback = () => {
    const username = localStorage.getItem('username')
    const {labbookName} = this.props
    this.props.setBuildingState(true)

    if(this.props.labbook.environment.containerStatus === "RUNNING"){

      StopContainerMutation(
        labbookName,
        username,
        'clientMutationId',
        (error) =>{

            BuildImageMutation(
            labbookName,
              username,
              (error) => {

                let showAlert = ((error !== null) && (error !== undefined))
                let message = showAlert ? error[0].message : '';
                this.setState({
                  'show': showAlert,
                  'message': message
                })
                this.props.setBuildingState(false)
                return "finished"
              }
            )
          }
      )
    }else {

      BuildImageMutation(
        labbookName,
        username,
        (error) => {

          let showAlert = ((error !== null) && (error !== undefined))
          let message = showAlert ? error[0].message : '';
          this.setState({
            'show': showAlert,
            'message': message
          })
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
              labbookName={this.props.labbookName}
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
              labbookName={this.props.labbookName}
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              containerStatus={this.props.containerStatus}
              editVisible={true}
              buildCallback={this._buildCallback}
              blockClass="Environment"
            />

            <PackageManagerDependencies
              ref="packageManagerDependencies"
              labbookName={this.props.labbookName}
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
              labbookName={this.props.labbookName}
              environmentId={this.props.labbook.environment.id}
              containerStatus={this.props.containerStatus}
            />

            <SweetAlert
              className="sa-error-container"
              show={this.state.show}
              type="error"
              title="Error"
              text={this.state.message}
              onConfirm={() => this.setState({ show: false })} />
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
