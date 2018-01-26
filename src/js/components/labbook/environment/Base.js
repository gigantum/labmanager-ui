//vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import Loader from 'Components/shared/Loader'

class Base extends Component {

  constructor(props){
    super(props);
    this.state = {'modal_visible': false};

    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setComponent = this._setComponent.bind(this)
  }

  /**
  *  @param {none}
  *  check if edit is enabled
  */
  _editVisible(){
    return false;//this.props.editVisible //alwasys false until api can support rebuilding base image
  }
  /**
  *  @param {none}
  *   open modal window
  */
  _openModal = () =>{
      this.setState({'modal_visible': true})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.remove('hidden')
      }
  }
  /**
  *  @param {none}
  *   hide modal window
  */
  _hideModal = () => {
    this.setState({'modal_visible': false})
    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }
  }
  /**
  *  @param {Object}
  *  hidemodal
  */
  _setComponent = (comp) => {

    this._hideModal();
  }

  render(){
    const {base} = this.props.environment;
    const {blockClass} = this.props;
    
    let editDisabled = ((this.props.containerStatus) && (this.props.containerStatus.state.imageStatus === "BUILD_IN_PROGRESS")) ? true : false;

    if (base) {
      return(
        <div className={blockClass + '__base-image'}>

            <div className={blockClass + '__header-container' }>
              <h4 className={blockClass + '__header'}>Base Image</h4>
              {
                this._editVisible() &&
                <div className={blockClass + '__edit-container'}>
                    <button
                      id="baseEdit"
                      onClick={() => this._openModal()}
                      className={blockClass + '__edit-button'}
                      disabled={editDisabled}
                    >
                    </button>
                </div>
              }
            </div>
            <div className={blockClass + '__info flex justify--left'}>

              <div className={ blockClass + '__card flex justify--space-around'}>
                <div className={blockClass + '__image-container flex-1-0-auto flex flex--column justify-center'}>
                  <img height="50" width="50" src={base.info.icon} alt={base.info.humanName} />
                </div>

                <div className={blockClass + '__card-text flex-1-0-auto'}>
                  <p className={blockClass + '__human-name'}>{base.info.humanName}</p>
                  <p>{base.info.description}</p>
                </div>
              </div>


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
  Base,
  {environment: graphql`fragment Base_environment on Environment @connection(key:"Base_environment"){
    base{
      id
      schema
      repository
      componentId
      revision
      name
      description
      readme
      tags
      icon
      osClass
      osRelease
      license
      url
      languages
      developmentTools
      packageManagers
      dockerImageServer
      dockerImageNamespace
      dockerImageRepository
      dockerImageTag
    }
  }`
}
)
