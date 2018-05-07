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
import LocalLabbookPanel from 'Components/dashboard/labbooks/LocalLabbooks/LocalLabbookPanel'
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
    console.log(this.props.labbooks)
    return(
      <div className='LocalLabbooks__labbooks'>
      <div className="LocalLabbooks__sizer grid">

        <ImportModule
            ref="ImportModule_localLabooks"
            {...this.props}
            showModal={this.props.showModal}
            className="LocalLabbooks__panel column-4-span-3 LocalLabbooks__panel--import"
        />
        {
          this.props.labbooks && this.props.labbooks.map((edge) => {
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
    </div>
    )
  }
}