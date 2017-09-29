//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import AddCustomDependencies from 'Components/wizard/AddCustomDependencies'
import Loader from 'Components/shared/Loader'

let addCustomDependencies;

class CustomDependencies extends Component {
  constructor(props){
    super(props);
    this.state = {'modal_visible': false};

    addCustomDependencies = this;
  }
  /*
    function()
    open modal view
  */
  _openModal(){
      this.setState({'modal_visible': true})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.remove('hidden')
      }
  }
  /*
    function()
    hide modal view
  */
  _hideModal(){
      this.setState({'modal_visible': false})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.add('hidden')
      }
  }

  _setComponent(comp){

    addCustomDependencies._hideModal();
  }
  render(){

    let customDependencies = this.props.environment.customDependencies;
    let blockClass = this.props.blockClass;
    if (customDependencies) {
      return(
        <div className={blockClass + '__dependencies'}>
            <div className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
              <div
                id="customDependenciesEditClose"
                className="Environment__modal-close"
                onClick={() => this._hideModal()}>
                X
              </div>
              <AddCustomDependencies
                labbookName={this.props.labbookName}
                environmentId={this.props.environmentId}
                setComponent={this._setComponent}
                buildCallback={this.props.buildCallback}
                nextComponent={"continue"}
                environmentView={true}
                connection={'CustomDependencies_customDependencies'}
                toggleDisabledContinue={() => function(){}}
              />
            </div>

            <h4 className={blockClass + '__header'}>Custom Dependencies</h4>

            <div className={blockClass + '__info flex justify--left'}>
            {
              customDependencies.edges.map((edge, index) => {

                return(
                  <div
                    key={this.props.labbookName + edge.node.id + index} className={blockClass + '__dependencies'}>

                    <div className={blockClass + '__card flex justify--space-around'}>

                        <div className="flex-1-0-auto flex flex--column justify-center">
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
                  </div>
                )
              })

            }
            {
                (this.props.editVisible) &&

                <div className={'Environment__edit-container'}>
                    <button
                      id="customDependenciesEdit"
                      onClick={() => this._openModal()} className="Environment__edit-button">
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

export default createPaginationContainer(
  CustomDependencies,
  {
    environment: graphql`fragment CustomDependencies_environment on Environment {
      customDependencies(first: $first, after: $cursor) @connection(key:"CustomDependencies_customDependencies"){
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
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {

    first = 10;
    name = props.labbookName;
    owner = 'default';
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
