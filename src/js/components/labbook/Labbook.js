//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
//components
import Notes from './notes/Notes'
import Code from './code/Code'
import Data from './data/Data'
import Overview from './overview/Overview'
import Environment from './environment/Environment'

import environment from '../../createRelayEnvironment'
let labbook;
//labbook query with notes fragment
const LabbookQuery =  graphql`
  query LabbookQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
    labbook(name: $name, owner: $owner){
      id
      description
      activeBranch{
        id
        name
        prefix
        commit{
          hash
          shortHash
          committedOn
          id
        }
      }
      environment{
        containerStatus
      }
      ...Environment_labbook
      ...Overview_labbook
      ...Notes_labbook
    }
  }`

//navigation items to generate navigation menu
const navigation_items = [
  {id:'overview', name: 'Overview'},
  {id:'notes', name: 'Notes', 'fragment': '...Notes_labbook'},
  {id:'environment', name: 'Environment', 'fragment': '...Environment_labbook'},
  {id:'code', name: 'Code'},
  {id:'data', name: 'Data'},
]

export default class Labbook extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'selectedComponent': (this.props.match.params.labbookMenu) ? this.props.match.params.labbookMenu : 'overview' ,
      'containerState': 'Closed',
      'containerStatus': ''
    }

    labbook = this;
  }

  componentWillMount() {

      this.setState({'selectedComponent': this.props.match.params.labbookMenu})
  }
  /*
    function(sring):
    updates container state
  */
  _setContainerState(value){
    labbook.setState({'containerStatus': value})
    value = (value === 'RUNNING') ? 'Open' : value;
    value = (value === 'NOT_RUNNING') ? 'Closed' : value;
    labbook.setState({'containerState': value})

  }
  /*
    function(string): input string componenetName
    updatesState
  */
  _setSelectedComponent(componentName){
    this.setState({'selectedComponent': componentName})
    this.props.history.replace(`../../labbooks/${this.props.match.params.labbookName}/${componentName}`)
  }
  /*
    function():
    return QueryRenderer with parsed props
  */
  _getNotesRenderer(){

    return (<QueryRenderer
      key={this.props.match.params.labbookName + '_query_renderer_labbook'}
      environment={environment}
      query={LabbookQuery}
      variables={{name:this.props.match.params.labbookName, owner: 'default', first: 20}}
      render={({error, props}) => {

        if (error) {
          console.error(error)
          return <div>{error.message}</div>
        } else if (props) {
          if(labbook.state.containerStatus !== props.labbook.environment.containerStatus){
            labbook._setContainerState(props.labbook.environment.containerStatus)
          }
          return <Notes
            key={props.labbook}
            labbook={props.labbook}
            {...props}
            labbookName={this.props.match.params.labbookName}
            labbookId={props.labbook.id}
          />
        }
        return <div>Loading</div>
      }}
    />)
  }
  /*
    function():
    return QueryRenderer with parsed props
  */
  _getEnvironmentRenderer(){

    return (<QueryRenderer
      key={this.props.match.params.labbookName + '_query_renderer_labbook'}
      environment={environment}
      query={LabbookQuery}
      variables={{name:this.props.match.params.labbookName, owner: 'default', first: 20}}
      render={({error, props}) => {

        if (error) {
          return <div>{error.message}</div>
        } else if (props) {
          return <Environment
            labbook={props.labbook}
            labbookId={props.labbook.id}
            setContainerState={this._setContainerState}
            key={props.labbook} {...props}
            labbookName={this.props.match.params.labbookName} />
        }
        return <div>Loading</div>
      }}
    />)
  }



  _getOverviewRenderer(){

    return (<QueryRenderer
      key={this.props.match.params.labbookName + '_query_renderer_labbook'}
      environment={environment}
      query={LabbookQuery}
      variables={{name:this.props.match.params.labbookName, owner: 'default', first: 20}}
      render={({error, props}) => {

        if (error) {
          console.error(error)
          return <div>{error.message}</div>
        } else if (props) {
          return <Overview
            labbook={props.labbook}
            description={props.labbook.description}
            labbookName={this.props.match.params.labbookName}
          />
        }
        return <div>Loading</div>
      }}
    />)

  }

  //gets component for view section
  _getSelectedComponent(){
    switch(this.state.selectedComponent){
      case 'notes':
        return this._getNotesRenderer()
      case 'environment':
        return(this._getEnvironmentRenderer())
      case 'code':
        return(<Code labbookName={this.props.match.params.labbookName} setContainerState={this._setContainerState} />)
      case 'data':
        return(<Data />)
      case 'overview':
        return this._getOverviewRenderer()
      default:
        return this._getOverviewRenderer()
    }
  }

  /*
      function(object): inputs an obect with id and name attributes
      return: jsx nav item
  */
  _getNavItem(item){
    return (
      <li key={item.id} onClick={()=> this._setSelectedComponent(item.id)}
        className={(this.state.selectedComponent === item.id) ? 'selected' : 'Labbook__navigation-item--' + item.id}>
        {item.name}
      </li>
    )
  }

  render(){

    let labbookName = this.props.match.params.labbookName;
    return(
      <div className="Labbook">

        <h4 className="Labbook__title">Lab Books</h4>
         <div className="Labbook__inner-container flex flex--row">
           <div className="Labbook__component-container flex flex--column">
             <div className="Labbook__header flex flex--row justify--space-between">
               <h4 className="Labbook__name-title">{labbookName}</h4>
               <div className={'Labbook__container-state ' + this.state.containerState}>
                 {this.state.containerState}
               </div>
            </div>
             <div className="Labbook__navigation-container mui-container flex-0-0-auto">
               <ul className="Labbook__navigation flex flex--row">
                 {
                   navigation_items.map((item) => {
                     return (this._getNavItem(item))
                   })
                 }
               </ul>
             </div>

             <div className="Labbook__view mui-container flex flex-1-0-auto">
                {this._getSelectedComponent()}
             </div>

          </div>
          <div className="Labbook__info">
            <div className="Labbook__info-card">

            </div>
          </div>
        </div>
      </div>
    )
  }
}
