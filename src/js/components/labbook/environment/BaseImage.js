import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'

class BaseImage extends Component {

  render(){
    let baseImage = this.props.environment.baseImage;
    if (baseImage) {
      return(
        <div className="Environment__base-image">
            <h4 className="Environment__header">Base Image</h4>
            <p>{baseImage.info.description}</p>
            <div className="Environment__info flex justify--left">
              <div className="Environment__card flex justify--space-around">
                <div className="flex-1-0-auto flex flex--column justify-center">
                  <img height="50" width="50" src={baseImage.info.icon} alt={baseImage.info.humanName} />
                </div>
                <div className="Environment__card-text flex-1-0-auto">
                  <p>{baseImage.info.name}</p>
                  <p>{baseImage.info.humanName}</p>
                </div>
              </div>
              <div className="Environment__edit-container">
                  <button onClick={() => this._openModal()} className="Environment__edit-button">Edit</button>
              </div>
          </div>
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
  BaseImage,
  {environment: graphql`fragment BaseImage_environment on Environment @connection(key:"BaseImage_environment"){
    baseImage{
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
      osClass
      osRelease
      server
      namespace
      repository
      tag
      availablePackageManagers
    }
  }`
}
)
