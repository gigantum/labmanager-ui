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

let environ;

class Environment extends Component {
  constructor(props){
  	super(props);

    this.state ={
      'modal_visible': false,
      'readyToBuild': false,
    }
    environ = this; //set variable for encapsulation
  }

  /*
    function()
    open modal view
  */
  _openModal(){
      environ.setState({'modal_visible': true})
      document.getElementById('modal__cover').classList.remove('hidden')
  }
  /*
    function()
    hide modal view
  */
  _hideModal(){
      environ.setState({'modal_visible': false})
      document.getElementById('modal__cover').classList.add('hidden')
  }

  /*
    function()
    callback that triggers buildImage mutation
  */

  _buildCallback(){

    environ.props.setBuildingState(true)

    BuildImageMutation(
      environ.props.labbookName,
      'default',
      (log) => {

        environ.props.setBuildingState(false)
      }
    )
  }

  _setBaseImage(baseImage){
      environ.setState({"readyToBuild": true})
  }

  render(){
    if(this.props.labbook){
      let env = this.props.labbook.environment;
      let baseImage = env.baseImage;

      return(
        <div className="Environment">

            <BaseImage
              ref="baseImage"
              labbookName={this.props.labbookName}
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              editVisible={true}
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
              editVisible={true}
              buildCallback={this._buildCallback}
              blockClass="Environment"
            />

            <PackageManagerDependencies
              ref="packageManagerDependencies"
              labbookName={this.props.labbookName}
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              setBaseImage={this._setBaseImage}
              setComponent={this._setComponent}
              buildCallback={this._buildCallback}
              baseImage={baseImage}
            />

            <CustomDependencies
              ref="CustomDependencies"
              environment={this.props.labbook.environment}
              blockClass="Environment"
              buildCallback={this._buildCallback}
              editVisible={true}
              labbookName={this.props.labbookName}
              environmentId={this.props.labbook.environment.id}
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
