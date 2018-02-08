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

      return(
        <div className="Base">
          <div className="Base__header-container">
            <h4 className="Base__header">Base</h4>
          </div>

          <div className="Base__info">
            <div className="Base__card">

              <div className="Base__image-container">
                <img height="70" width="70" src={base.icon} alt={base.name} />

                <div className="Base__title">
                  <h6 className="Base__name">{base.name}</h6>
                  <p>{base.osClass + ' ' + base.osRelease}</p>
                </div>

              </div>

              <div className="Base__card-text">

                <div>
                  <p>{base.description}</p>
                </div>

                <div className="Base__categories">

                  <div className="Base__categories-languages">
                    <h6>Languages</h6>
                    <ul>
                      {
                        base.languages.map((language, index)=>{
                          return(<li key={language + index}>{language}</li>)
                        })
                      }
                    </ul>
                  </div>

                  <div className="Base__categories-tools">
                    <h6>Tools</h6>
                    <ul>
                      {
                        base.developmentTools.map((tool, index)=>{
                          return(<li key={tool + index}>{tool}</li>)
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
