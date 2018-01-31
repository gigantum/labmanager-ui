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

    if (base) {
      console.log(base)
      return(
        <div className="Environment__base-image">

            <div className="Environment__header-container">
              <h4 className="Environment__header">Environment</h4>
            </div>
            <div className="Environment__info">

              <div className="Environment__card">
                <div className="Environment__image-container">
                  <img height="70" width="70" src={base.icon} alt={base.name} />
                  <div className="Environment__title">
                    <h6 className="Environment__name">{base.name}</h6>
                    <p>{base.osClass + ' ' + base.osRelease}</p>
                  </div>
                </div>

                <div className="Environment__card-text">
                  <div>
                    <p>{base.description}</p>
                  </div>

                  <div className="Environment__categories">
                    <div className="Environment__categories-languages">
                      <h6>Languages</h6>
                      <ul>
                        {
                          base.languages.map((language)=>{
                            return(<li>{language}</li>)
                          })
                        }
                      </ul>
                    </div>
                    <div className="Environment__categories-tools">
                      <h6>Tools</h6>
                      <ul>
                        {
                          base.developmentTools.map((tool)=>{
                            return(<li>{tool}</li>)
                          })
                        }
                      </ul>
                    </div>
                  </div>
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
