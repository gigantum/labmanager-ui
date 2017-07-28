//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
//components
import Notes from './notes/Notes'
import Code from './Code'
import InputData from './InputData'
import OutputData from './OutputData'
import Workflow from './Workflow'
import Environment from './Environment'

import environment from '../../createRelayEnvironment'

//labbook query with notes fragment
const LabbookQuery =  graphql`
query LabbookQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
  labbook(name: $name, owner: $owner){
    id
    description
    ...Notes_labbook
  }
}`
//navigation items to generate navigation menu
const navigation_items = [
  {id:'notes', name: 'Notes'},
  {id:'environment', name: 'Environment'},
  {id:'code', name: 'Code'},
  {id:'worflow', name: 'Workflow'},
  {id:'input-data', name: 'Input Data'},
  {id:'output-data', name: 'Output Data'}
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
      environment={environment}
      query={LabbookQuery}
      variables={{name:this.props.match.params.labbook_name, owner: 'default', first: 20}}
      render={({error, props}) => {
        if (error) {
          return <div>{error.message}</div>
        } else if (props) {

          return <Notes labbook={props.labbook} {...props} labbook_name={this.props.match.params.labbook_name} />
        }
        return <div>Loading</div>
      }}
    />)
  }

  //gets component for view section
  _getSelectedComponent(){
    let selectedComponent = this.state.selectedComponent;
    switch(selectedComponent){
      case 'notes':
        let notes = this._getNotesRenderer() //returns <Notes /> component in a QueryRenderer
        return notes;
      case 'environment':
        return(<Environment />)
      case 'code':
        return(<Code />)
      case 'worflow':
        return(<Workflow />)
      case 'input-data':
        return(<InputData />)
      case 'output-data':
        return(<OutputData />)
      default:
        //return(<Notes />)
      break;
    }
  }

  /*
      function(object): inputs an obect with id and name attributes
      return: jsx nav item
  */
  _getNavItem(item){
    return (
      <li onClick={()=> this._setSelectedComponent(item.id)}
        className={(this.state.selectedComponent === item.id) ? 'selected' : 'labbook__navigation-item--' + item.id}>
        {item.name}
      </li>
    )
  }

  render(){

    let labbook_name = this.props.match.params.labbook_name;

    return(
      <div className="labbook__container">
        <h4>{labbook_name}</h4>

         <div className="labbook__inner-container flex flex--row ">

           <div className="labbook__navigation-container mui-container flex-0-0-auto">
             <ul className="labbook__navigation">
               {
                 navigation_items.map((item) => {
                   return (this._getNavItem(item))
                 })
               }
             </ul>
           </div>

           <div className="labbook__view-container mui-container flex-1-0-auto">
              {this._getSelectedComponent()}
           </div>

        </div>
      </div>
    )
  }
}
