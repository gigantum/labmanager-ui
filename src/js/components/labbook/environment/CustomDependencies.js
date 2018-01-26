//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import AddCustomDependencies from 'Components/wizard/CustomDependencies'
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'
let owner
class CustomDependencies extends Component {
  constructor(props){
    super(props);

    const {labbookName} = store.getState().routes
    owner = store.getState().routes.owner //TODO clean this up when fixing custom dependencies

    this.state = {
      'modal_visible': false,
      owner,
      labbookName
    };

    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setComponent = this._setComponent.bind(this)
  }

  /**
  *  @param {none}
  *  open modal window
  */
  _openModal = () => {
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
  *  @param {comp}
  *   hide modal window
  */
  _setComponent = (comp) => {

    this._hideModal();
  }
  render(){

    const {customDependencies} = this.props.environment;
    const {blockClass} = this.props;

    let editDisabled = ((this.props.containerStatus) && (this.props.containerStatus.state.imageStatus === "BUILD_IN_PROGRESS")) ? true : false;
    if (customDependencies) {
      return(
        <div className={blockClass + '__dependencies'}>

            <div className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
              <div
                id="customDependenciesEditClose"
                className="Environment__modal-close"
                onClick={() => this._hideModal()}>
              </div>
              <AddCustomDependencies
                {...this.props}
                setComponent={this._setComponent}
                nextComponent={"continue"}
                environmentView={true}
                connection={'CustomDependencies_customDependencies'}
                toggleDisabledContinue={() => function(){}}
              />
            </div>

            <div className={blockClass + '__header-container'}>

              <h4 className={blockClass + '__header'}>
                Custom Dependencies
              </h4>

              {
                  (this.props.editVisible) &&

                  <div className={'Environment__edit-container'}>
                      <button
                        id="customDependenciesEdit"
                        onClick={() => this._openModal()}
                        className="Environment__edit-button"
                        disabled={editDisabled}
                        >
                      </button>
                  </div>

              }
            </div>
            <div className={blockClass + '__info flex justify--left'}>
              {
                customDependencies.edges.map((edge, index) => {
                  if(edge.node){
                    return this._customDependencyItem(edge, index, blockClass)
                  }
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

  _customDependencyItem(edge, index, blockClass){
      if(edge.node.info){
        return(
          <div
            key={this.props.labbookName + edge.node.id + index} className={blockClass + '__dependencies'}>
            <div className={blockClass + '__card flex justify--space-around'}>

                <div className={blockClass + '__image-container flex-1-0-auto flex flex--column justify-center'}>
                  <img
                    height="50"
                    width="50"
                    src={edge.node.info.icon}
                    alt={edge.node.info.humanName} />
                </div>

                <div className={blockClass + '__card-text flex-1-0-auto'}>
                  <p>{edge.node.info.humanName}</p>
                  <p>{edge.node.info.description}</p>
                </div>

            </div>
        </div>)
    }else{
      return(
        <div
          key={this.props.labbookName + edge.node.id + index} className={blockClass + '__dependencies'}>
          <div className={blockClass + '__card flex justify--space-around'}>

              <div className={blockClass + '__image-container flex-1-0-auto flex flex--column justify-center'}>
                <img
                  height="50"
                  width="50"
                  src={''}
                  alt={'no-package'} />
              </div>

              <div className={blockClass + '__card-text flex-1-0-auto'}>
                <p>{'issue with package'}</p>
                <p>{'this package had trouble rendering metadata'}</p>
              </div>

          </div>
      </div>)
    }
  }
}

export default createPaginationContainer(
  CustomDependencies,
  {
    environment: graphql`fragment CustomDependencies_environment on Environment {
      customDependencies(first: $first, after: $cursor) @connection(key:"CustomDependencies_customDependencies"){
        edges{
          node{
            id
            schema
            repository
            componentId
            revision
            name
            description
            tags
            license
            osBaseClass
            url
            requiredPackageManagers
            dockerSnippet
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
  }`

},
{
    direction: 'forward',
    metadata: {field: 'customDependencies'},
    getConnectionFromProps(props) {
        return props.labbook && props.labbook.environment;
    },
    getFragmentVariables(prevVars, first) {
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor}, fragmentVariables) {
    first = 10;
    const name = props.labbookName;

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
    query CustomDependenciesPaginationQuery($first: Int!, $cursor: String!){
     labbook{
       environment{
         ...CustomDependencies_environment
       }
     }
   }`
}
)
