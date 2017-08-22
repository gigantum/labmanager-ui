import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import BaseImage from './BaseImage'
import DevEnvironments from './DevEnvironments'
import PackageManagerDependencies from './PackageManagerDependencies'
import CustomDependencies from './CustomDependencies'

import BuildImageMutation from './../../../mutations/BuildImageMutation'

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

  componentWillMount() {
    this.props.setContainerState(environ.props.labbook.environment.containerStatus)
  }
  /*
    function()
    open modal view
  */
  _openModal(){
      environ.setState({'modal_visible': true})
  }
  /*
    function()
    hide modal view
  */
  _hideModal(){
      environ.setState({'modal_visible': false})
  }

  /*
    function()
    sets variables for build state
  */


  /*
    function()
    callback that triggers buildImage mutation
  */

  _buildCallback(){

    BuildImageMutation(
      environ.props.labbookName,
      'default',
      (log) => {
        environ.props.setContainerState(environ.props.labbook.environment.containerStatus)
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
              environment={this.props.labbook.environment}
              editVisible={true}
              blockClass="Environment"
             />

            <DevEnvironments
              ref="devEnvironments"
              labbookName={this.props.labbookName}
              environment={this.props.labbook.environment}
              editVisible={true}
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
              editVisible={true}
            />

          </div>


      )
    }else{
      return(
          <div className="Environment">
              loading
          </div>
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
