//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import SelectDevelopmentEnvironment from 'Components/wizard/SelectDevelopmentEnvironment'
import Loader from 'Components/shared/Loader'

class DevEnvironments extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'modal_visible': false
    };

    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setComponent = this._setComponent.bind(this)
  }
  /**
  *  @param {None}
  *  open modal view
  */
  _openModal = () => {
      this.setState({'modal_visible': true})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.remove('hidden')
      }
  }
  /**
  *  @param {None}
  *  hide modal view
  */
  _hideModal = () =>{
      this.setState({'modal_visible': false})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.add('hidden')
      }
  }
  /**
  *  @param {object}
  *  hide modal view
  */
  _setComponent = (comp) => {

    this._hideModal();
  }

  render(){

    const {devEnvs} = this.props.environment;
    const {blockClass} = this.props;

    let editDisabled = ((this.props.containerStatus) && (this.props.containerStatus.state.imageStatus === "BUILD_IN_PROGRESS")) ? true : false;

    if (devEnvs) {
      return(
        <div className={ blockClass + '__development-environment'}>
          <div className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
            <div
              id="devEnvironmentsEditClose"
              className="Environment__modal-close"
              onClick={() => this._hideModal()}>
            </div>
            <SelectDevelopmentEnvironment
              {...this.props}
              availablePackageManagers={(this.props.baseImage) ? this.props.baseImage.availablePackageManagers : null}
              setComponent={this._setComponent}
              nextComponent={"continue"}
              connection={'DevEnvironments_devEnvs'}
              environmentView={true}
              toggleDisabledContinue={() => function(){}}
            />
          </div>
          <div className={blockClass + '__header-container'}>
              <h4 className={blockClass + '__header'}>Development Environments</h4>
              {
                  (this.props.editVisible) &&
                  <div className="Environment__edit-container">
                      <button
                        id="devEnvironmentsEdit"
                        onClick={()=> this._openModal()}
                        className="Environment__edit-button"
                        disabled={editDisabled}
                        >

                      </button>
                  </div>
              }
            </div>


            <div className={blockClass + '__info flex justify--left flex--wrap'}>
            {
              devEnvs.edges.map((edge, index) => {
              return(
                <div
                  key={this.props.labbookName + edge.node.id}
                  className={blockClass + '__development-environment-item'}>

                  <div className={blockClass + '__card flex justify--space-around'}>
                    <div className={blockClass + '__image-container flex-1-0-auto flex flex--column justify-center'}>
                      <img height="50" width="50" src={edge.node.info.icon} alt={edge.node.info.humanName} />
                    </div>
                    <div className={blockClass + '__card-text flex-1-0-auto'}>
                      <p>{edge.node.info.humanName}</p>
                      <p>{edge.node.info.description}</p>

                    </div>
                  </div>
                </div>
              )
              })

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

/**
*  @param {ReactElement, Object}
*   open modal window
*/

export default createPaginationContainer(
  DevEnvironments,
  {
    environment: graphql`fragment DevEnvironments_environment on Environment{
    devEnvs(first: $first, after: $cursor)  @connection(key:"DevEnvironments_devEnvs"){
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
  }`
},
{
    direction: 'forward',
    getConnectionFromProps(props) {
        return props.labbook && props.labbook.environment;
    },
    getFragmentVariables(prevVars, first) {
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {
    const username = localStorage.getItem('username')
    first = 10;
    name = props.labbookName;
    owner = username;
     return {
       first,
       cursor,
       name,
       owner
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
   query DevEnvironmentsPaginationQuery($first: Int!, $cursor: String!){
     labbook{
       environment{
         ...DevEnvironments_environment
       }
     }

   }`
}
)
