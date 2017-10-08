//vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import SelectBaseImage from 'Components/wizard/SelectBaseImage'
import Loader from 'Components/shared/Loader'
let baseImage = null;
class BaseImage extends Component {

  constructor(props){
    super(props);
    this.state = {'modal_visible': false};
    baseImage = this;
  }

  /**
  *  @param {none}
  *  check if edit is enabled
  */
  _editVisible(){
    return this.props.editVisible
  }
  /**
  *  @param {none}
  *   open modal window
  */
  _openModal(){
      this.setState({'modal_visible': true})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.remove('hidden')
      }
  }
  /**
  *  @param {none}
  *   hide modal window
  */
  _hideModal(){
    this.setState({'modal_visible': false})
    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }
  }
  /**
  *  @param {Object}
  *  hidemodal
  */
  _setComponent(comp){

    baseImage._hideModal();
  }

  render(){
    let baseImage = this.props.environment.baseImage;
    let blockClass = this.props.blockClass;
    console.log(this.props.containerStatus)
    if (baseImage) {
      return(
        <div className={blockClass + '__base-image'}>
            <div id='modal' className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
                <div
                  id="baseImageEditClose"
                  className="Environment__modal-close"
                  onClick={() => this._hideModal()}>
                  X
                </div>

                <SelectBaseImage
                  ref="selectBaseImage"
                  labbookName={this.props.labbookName}
                  setBaseImage={this.props.setBaseImage}
                  setComponent={this._setComponent}
                  environmentView={true}
                  nextWindow={'selectDevelopmentEnvironment'}
                  buildCallback={this.props.buildCallback}
                  nextComponent={"continue"}
                  connection={'BaseImage_environment'}
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
                this._editVisible() &&
                <div className={blockClass + '__edit-container'}>
                    <button
                      id="baseImageEdit"
                      onClick={() => this._openModal()}
                      className={blockClass + '__edit-button'}
                  
                    >
                      Edit
                    </button>
                </div>
              }
          </div>
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
  BaseImage,
  {environment: graphql`fragment BaseImage_environment on Environment @connection(key:"BaseImage_environment"){
    baseImage {
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
