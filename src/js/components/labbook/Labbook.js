//vendor
import React, { Component } from 'react'
import { BrowserRouter as Router, Route , Switch, Link} from 'react-router-dom';
import {
  QueryRenderer,
  createFragmentContainer,
  graphql
} from 'react-relay'

//components
import Notes from './notes/Notes'
import Code from './code/Code'
import Data from './data/Data'
import Overview from './overview/Overview'
import Environment from './environment/Environment'
import UserNote from './UserNote'

import Config from './../../config'

let labbook;

class Labbook extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'selectedComponent': (this.props.location.pathname.split('/').length > 3) ? this.props.location.pathname.split('/')[3] : 'overview' ,
      'containerState': 'Closed',
      'containerStatus': '',
      'modalVisible': ''
    }

    labbook = this;

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
      function(object): inputs an obect with id and name attributes
      return: jsx nav item
  */
  _getNavItem(item){
    return (
      <div key={item.id}
        className={(this.state.selectedComponent === item.id) ? 'selected' : 'Labbook__navigation-item--' + item.id}
        onClick={()=> this._setSelectedComponent(item.id)}
        >
        <Link to={`../../labbooks/${this.props.match.params.labbookName}/${item.id}`} replace={true}>{item.name}</Link>
      </div>
    )
  }

  _showLabbookModal(){
    document.getElementById('labbookModal').classList.remove('hidden')
    document.getElementById('modal__cover').classList.remove('hidden')
    labbook.setState({'modalVisible': true})
  }

  _hideLabbookModal(){
    document.getElementById('labbookModal').classList.add('hidden')
    document.getElementById('modal__cover').classList.add('hidden')
    labbook.setState({'modalVisible': false})
  }

  render(){

    let labbookName = this.props.labbookName;

    return(
      <div className="Labbook">

        <h4 className="Labbook__title">Lab Books</h4>
         <div className="Labbook__inner-container flex flex--row">
           <div className="Labbook__component-container flex flex--column">
             <div className="Labbook__header flex flex--row justify--space-between">
               <h4 className="Labbook__name-title">{labbookName}</h4>
               <div className="Labbook__user-note" onClick={() => this._showLabbookModal()}>
                  <h5>Add Note</h5>
                  <div className="Labbook__user-note--add"></div>
               </div>
               <div className={'Labbook__container-state ' + this.state.containerState}>
                 {this.state.containerState}
               </div>
            </div>
             <div className="Labbook__navigation-container mui-container flex-0-0-auto">
               <nav className="Labbook__navigation flex flex--row">
                 {
                   Config.navigation_items.map((item) => {
                     return (this._getNavItem(item))
                   })
                 }
               </nav>
             </div>
            <div className="Labbook__view mui-container flex flex-1-0-auto">


                <Switch>
                  <Route exact path={`${this.props.match.path}`} render={() => {

                      return (<Overview
                        key={this.props.labbookName + '_overview'}
                        labbook={this.props.labbook}
                        description={this.props.labbook.description}
                        labbookName={labbookName}
                      />)
                    }}
                  />

                  <Route path={`${this.props.match.path}/:labbookMenu`}>
                    <Switch>
                      <Route path={`${this.props.match.path}/overview`} render={() => {
                          return (<Overview
                            key={this.props.labbookName + '_overview'}
                            labbook={this.props.labbook}
                            description={this.props.labbook.description}
                            labbookName={labbookName}
                          />)
                        }}
                      />

                      <Route path={`${this.props.match.path}/notes`} render={() => {
                        return (<Notes
                            key={this.props.labbookName + '_notes'}
                            labbook={this.props.labbook}
                            notes={this.props.notes}
                            labbookName={labbookName}
                            labbookId={this.props.labbook.id}
                            {...this.props}
                          />)
                      }} />

                      <Route path={`${this.props.match.url}/environment`} render={() => {
                        return (<Environment
                          key={labbookName + '_environment'}
                          labbook={this.props.labbook}
                          labbookId={this.props.labbook.id}
                          setContainerState={this._setContainerState}
                          labbookName={labbookName}
                          {...this.props}
                        />)
                      }} />

                      <Route path={`${this.props.match.url}/code`} render={() => {
                        return (<Code
                          labbookName={labbookName}
                          setContainerState={this._setContainerState}
                        />)
                      }} />

                      <Route path={`${this.props.match.url}/data`} render={() => {
                        return (<Data/>)
                      }} />
                    </Switch>
                  </Route>
                </Switch>

            </div>

          </div>
          <div id="labbookModal" className="Labbook__modal hidden">
            <div onClick={() => this._hideLabbookModal()} className="UserNote__close">X</div>
            {
              (this.state.modalVisible) &&
              <UserNote labbookId={this.props.labbook.id} {...this.props} labbookName={labbookName} hideLabbookModal={this._hideLabbookModal}/>
            }
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


export default createFragmentContainer(
  Labbook,
  {
    labbook: graphql`
      fragment Labbook_labbook on Labbook{
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

      }`
  }

)
