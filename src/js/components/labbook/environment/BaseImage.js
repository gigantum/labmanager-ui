import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import SelectBaseImage from './../../wizard/SelectBaseImage'
let baseImage = null;
class BaseImage extends Component {

  constructor(props){
    super(props);
    this.state = {'modal_visible': false};
    baseImage = this;
  }

  _editVisiible(){
    return this.props.editVisible
  }

  _openModal(){
      this.setState({'modal_visible': true})
  }
  /*
    function()
    hide modal view
  */
  _hideModal(){
    this.setState({'modal_visible': false})
  }

  _setComponent(comp){

    baseImage._hideModal();
  }

  render(){
    let baseImage = this.props.environment.baseImage;
    let blockClass = this.props.blockClass;
    if (baseImage) {
      return(
        <div className={blockClass + '__base-image'}>
            <div id='modal__cover' className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
                <div
                  className="Environment__modal-close"
                  onClick={() => this._hideModal()}>
                  X
                </div>

                <SelectBaseImage
                  ref="selectBaseImage4"
                  labbookName={this.props.labbookName}
                  setBaseImage={this.props.setBaseImage}
                  setComponent={this._setComponent}
                  environmentView={true}
                  nextWindow={'selectDevelopmentEnvironment'}
                  buildCallback={this.props.buildCallback}
                  nextComponent={"continue"}
                  toggleDisabledContinue={() => function(){}}/>

            </div>
            <h4 className={blockClass + '__header'}>Base Image</h4>

            <div className={blockClass + '__info flex justify--left'}>
              <div className={ blockClass + '__card flex justify--space-around'}>
                <div className="flex-1-0-auto flex flex--column justify-center">
                  <img height="50" width="50" src={baseImage.info.icon} alt={baseImage.info.humanName} />
                </div>
                <div className={blockClass + '__card-text flex-1-0-auto'}>
                  <p className={blockClass + '__human-name'}>{baseImage.info.humanName}</p>
                  <p>{baseImage.info.description}</p>
                </div>
              </div>
              {
                this._editVisiible() &&
                <div className={blockClass + '__edit-container'}>
                    <button onClick={() => this._openModal()} className={blockClass + '__edit-button'}>Edit</button>
                </div>
              }
          </div>
        </div>
      )
    }else{
      return(
          <div className={blockClass + '__loading'}>
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
