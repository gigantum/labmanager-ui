import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'

import AddEnvironmentPackage from './../../wizard/AddEnvironmentPackage'

import environment from './../../../createRelayEnvironment'
import BuildImageMutation from './../../../mutations/BuildImageMutation'

let that;
class Environment extends Component {
  constructor(props){
  	super(props);

    this.state ={
      'modal_visible': false,
      'readyToBuild': false,
    }

    that = this;
  }

  componentWillMount() {
    this.props.setContainerState(that.props.labbook.environment.containerStatus)
  }

  _openModal(){
      this.setState({'modal_visible': true})
  }

  _hideModal(){
      this.setState({'modal_visible': false})
  }

  _setComponent(comp){
    that.props.setContainerState("Building")
    that.setState({"readyToBuild": true})
    that._hideModal();
  }

  _buildCallback(){

    BuildImageMutation(
      that.props.labbook_name,
      'default',
      (log) => {
        console.log(log)
        that.props.setContainerState(that.props.labbook.environment.containerStatus)
      }
    )
  }

  _setBaseImage(baseImage){
    that.setState({"readyToBuild": true})
  }

  render(){
    if(this.props.labbook){

    let env = this.props.labbook.environment;
    let baseImage = env.baseImage;
    let devEnvs = env.devEnvs;
    let packageDep = env.packageManagerDependencies;
    let customDependencies = env.customDependencies;
    return(
        <div className="Environment">

            <div id='modal__cover' className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
              <div
                className="Environment__modal-close"
                onClick={() => this._hideModal()}>
                X
              </div>
              <AddEnvironmentPackage
                availablePackageManagers={env.baseImage.availablePackageManagers}
                labbookName={this.props.labbook_name}
                labbookId={this.props.labbookId}
                environmentId={env.id}
                setBaseImage={this._setBaseImage}
                setComponent={this._setComponent}
                buildCallback={this._buildCallback}
                nextComponent={"continue"}
                environmentView={true}

              />
            </div>
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
            <div className="Environment__development-environment">
                <h4 className="Environment__header">Development Environments</h4>
                <div className="Environment__info flex justify--left">
                {
                  devEnvs.edges.map((edge, index) => {
                  return(
                    <div key={this.props.labbook_name + index} className="Environment__development-environment-item">
                      <p>{edge.node.info.description}</p>
                      <div className="Environment__card flex justify--space-around">
                        <div className="flex-1-0-auto flex flex--column justify-center">
                          <img height="50" width="50" src={edge.node.info.icon} alt={edge.node.info.humanName} />
                        </div>
                        <div className="Environment__card-text flex-1-0-auto">
                          <p>{edge.node.info.name}</p>
                          <p>{edge.node.info.humanName}</p>
                        </div>
                      </div>
                    </div>
                  )
                  })

                }
                <div className="Environment__edit-container">
                    <button className="Environment__edit-button">Edit</button>
                </div>
              </div>

            </div>
            <div className="Environment__dependencies">
                <h4 className="Environment__header">Custom Dependencies</h4>
                <div className="Environment__info flex justify--left">
                {
                  customDependencies.edges.map(edge => {
                    return(
                      <div key={this.props.labbook_name + edge.id} className="Environment__dependencies">
                        <p>{edge.node.info.description}</p>
                        <div className="Environment__card flex justify--space-around">
                            <div className="flex-1-0-auto flex flex--column justify-center">
                              <img height="50" width="50" src={edge.node.info.icon} alt={edge.node.info.humanName} />
                            </div>
                            <div className="Environment__card-text flex-1-0-auto">
                              <p>{edge.node.info.name}</p>
                              <p>{edge.node.info.humanName}</p>
                            </div>
                        </div>
                      </div>
                    )
                  })

                }
                <div className="Environment__edit-container">
                    <button className="Environment__edit-button">Edit</button>
                </div>
              </div>

              <h4 className="Environment__header">Package Dependencies</h4>
              <div className="Environment__info flex flex--row justify--left">
                <ul className="flex flex--row justify--left flex--wrap">
                {
                  packageDep.edges.map((edge, index) => {
                    return(
                      <li key={this.props.labbook_name + index}>
                        <div className="Environment__package-dependencies">

                            <div className="Environment__card-text flex flex--row justify--space-around flex-1-0-auto">
                              <p>{edge.node.packageManager}</p>
                              <p>{edge.node.packageName}</p>
                            </div>
                        </div>

                      </li>
                    )
                  })

                }
              </ul>

                <div className="Environment__edit-container">
                    <button className="Environment__edit-button" onClick={() => this._openModal()}>Edit</button>
                </div>
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
  Environment,
  graphql`fragment Environment_labbook on Labbook {
    environment{
      id
      imageStatus
      containerStatus
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
      devEnvs(first: $first){
        edges{
          cursor
          node{
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
            osBaseClass
            developmentEnvironmentClass
            installCommands
            execCommands
            exposedTcpPorts
          }
        }

        pageInfo{
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
      packageManagerDependencies(first: $first) @connection(key: "Environment_packageManagerDependencies" filters: ["first"]){
        edges{
          node{
            id
            packageManager
            packageName
            packageVersion
          }
          cursor
        }
        pageInfo{
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
      customDependencies(first: $first){
        edges{
          node{
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
            osBaseClass
            docker
          }
          cursor
        }
        pageInfo{
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }`
)
