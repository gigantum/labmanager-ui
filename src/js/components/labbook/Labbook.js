import React, { Component } from 'react'
import {
  createFragmentContainer,
  QueryRenderer,
  graphql
} from 'react-relay'
import { Link } from 'react-router-dom';
//components
import Notes from './notes/Notes'
import Code from './Code'
import InputData from './InputData'
import OutputData from './OutputData'
import Workflow from './Workflow'
import Environment from './Environment'

import environment from '../../createRelayEnvironment'

const LabbookQuery =  graphql`
query LabbookQuery($name: String!, $owner: String!, $first: Int!, $cursor: String!){
  labbook(name: $name, owner: $owner){
    id
    description
    notes(first: $first, after: $cursor) {
      ...Notes_notes
    }
  }
}`


const navigation_items = [
  {id:'notes', name: 'Notes'},
  {id:'environment', name: 'Environment'},
  {id:'code', name: 'Code'},
  {id:'worflow', name: 'Workflow'},
  {id:'input-data', name: 'Input Data'},
  {id:'output-data', name: 'Output Data'}
]

export default class Labbook extends React.Component {
  constructor(props){
  	super(props);

    this.state = {'selectedComponent': 'notes'}
  }

  _setSelectedComponent(componentName){
    this.setState({'selectedComponent': componentName})
  }

  _getSelectedComponent(){
    let selectedComponent = this.state.selectedComponent;
    switch(selectedComponent){
      case 'notes':

        return (<QueryRenderer
          environment={environment}
          query={LabbookQuery}
          variables={{name:this.props.match.params.labbook_name, owner: 'default', first: 20, cursor: ''}}
          render={({error, props}) => {
            
            if (error) {
              return <div>{error.message}</div>
            } else if (props) {

              return <Notes notes={props.labbook.notes} {...props} labbook_name={this.props.match.params.labbook_name} />
            }
            return <div>Loading</div>
          }}
        />)
        //return <Notes />
        // return(<Notes  />)
        break;
      case 'environment':
        return(<Environment />)
        break;
      case 'code':
        return(<Code />)
        break;
      case 'worflow':
        return(<Workflow />)
        break;
      case 'input-data':
        return(<InputData />)
        break;
      case 'output-data':
        return(<OutputData />)
        break;
      default:
        //return(<Notes />)
      break;
    }
  }

  render(){
    console.log(this.props)
    let labbook_name = this.props.match.params.labbook_name;
    return(
        <div className='labbook__container'>
             <h4>{this.props.match.params.labbook_name}</h4>

             <div className='labbook__inner-container flex flex--row '>
               <div className='labbook__navigation-container mui-container flex-0-0-auto'>
                 <ul className='labbook__navigation'>
                   {
                     navigation_items.map((item) => {
                       return (<li onClick={()=> this._setSelectedComponent(item.id)} className={(this.state.selectedComponent === item.id) ? 'selected' : 'labbook__navigation-item--' + item.id}>{item.name}</li>)
                     })
                   }
                 </ul>

               </div>
               <div className='labbook__view-container mui-container flex-1-0-auto'>
                  {this._getSelectedComponent()}
               </div>
             </div>
        </div>
      )
  }
}
