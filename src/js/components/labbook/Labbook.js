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
import Environment from './environment/Environment'

import environment from '../../createRelayEnvironment'

//labbook query with notes fragment
const NotesQuery =  graphql`
  query LabbookQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
    labbook(name: $name, owner: $owner){
      id
      description
      environment{
        id
        imageStatus
        containerStatus
      }
      ...Notes_labbook
    }
  }`

const EnvironmentQuery =  graphql`
  query LabbookEnvironmentQuery($first: Int!, $cursor: String){
    availableBaseImages(first: $first, after: $cursor){
      ...Environment_availableBaseImages
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

    this.state = {'selectedComponent': 'notes'}
  }
  /*
    function(string): input string componenetName
    updatesState
  */
  _setSelectedComponent(componentName){
    this.setState({'selectedComponent': componentName})
  }
  /*
    function():
    return QueryRenderer with parsed props
  */
  _getNotesRenderer(){
    return (<QueryRenderer
      key={this.props.match.params.labbook_name + '_query_renderer_labbook'}
      environment={environment}
      query={NotesQuery}
      variables={{name:this.props.match.params.labbook_name, owner: 'default', first: 20}}
      render={({error, props}) => {

        if (error) {
          console.log(error)
          return <div>{error.message}</div>
        } else if (props) {

          return <Notes key={props.labbook} labbook={props.labbook} {...props} labbook_name={this.props.match.params.labbook_name} />
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
      key={this.props.match.params.labbook_name + '_query_renderer_labbook'}
      environment={environment}
      query={EnvironmentQuery}
      variables={{first: 20}}
      render={({error, props}) => {

        if (error) {
          console.log(error)
          return <div>{error.message}</div>
        } else if (props) {

          return <Environment labbook={{}} key={props.labbook} availableBaseImages={props.availableBaseImages} {...props} labbook_name={this.props.match.params.labbook_name} />
        }
        return <div>Loading</div>
      }}
    />)
  }

  //gets component for view section
  _getSelectedComponent(){
    let selectedComponent = this.state.selectedComponent;
    let notes;
    switch(selectedComponent){
      case 'notes':
        notes = this._getNotesRenderer() //returns <Notes /> component in a QueryRenderer
        return notes;
      case 'environment':
        return(this._getEnvironmentRenderer())
      case 'code':
        return(<Code />)
      case 'data':
        return(<Data />)
      default:
        notes = this._getNotesRenderer()
        return(notes);
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

    let labbook_name = this.props.match.params.labbook_name;

    return(
      <div className="Labbook">

        <h4 className="Labbook__title">Lab Books</h4>
         <div className="Labbook__inner-container flex flex--column ">
           <h4 className="Labbook__name-title">{labbook_name}</h4>
           <div className="Labbook__navigation-container mui-container flex-0-0-auto">
             <ul className="Labbook__navigation flex flex--row">
               {
                 navigation_items.map((item) => {
                   return (this._getNavItem(item))
                 })
               }
             </ul>
           </div>

           <div className="Labbook__view mui-container flex-1-0-auto">
              {this._getSelectedComponent()}
           </div>

        </div>
      </div>
    )
  }
}
