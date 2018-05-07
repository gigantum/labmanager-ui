//vendor
import store from 'JS/redux/store'
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//components
import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'
import LocalLabbookPanel from 'Components/dashboard/labbooks/LocalLabbookPanel'
import ImportModule from 'Components/import/ImportModule'
//Mutations
import RenameLabbookMutation from 'Mutations/RenameLabbookMutation'
//utils
import Validation from 'JS/utils/Validation'

export default class LocalLabbooks extends Component {

  constructor(props){
  	super(props);

    this.state = {
    }
  }


  render(){
    return(
      <div>
        {
          this.props.labbooks.map((edge) => {
            return (
              <LocalLabbookPanel
                key={edge.node.name}
                ref={'LocalLabbookPanel' + edge.node.name}
                className="LocalLabbooks__panel"
                edge={edge}
                history={this.props.history}
                goToLabbook={this._goToLabbook}/>
            )
          })
        }
      </div>
    )
  }
}