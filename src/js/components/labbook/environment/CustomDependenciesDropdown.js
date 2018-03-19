//vendor
import React, { Component } from 'react'
import {QueryRenderer, graphql} from 'react-relay'
import classNames from 'classnames'
//environment
import environment from 'JS/createRelayEnvironment'
//components
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'

export const CustomDependenciesDropdownQuery =  graphql`
  query CustomDependenciesDropdownQuery($first: Int!, $cursor: String){
    availableCustomDependencies(first: $first, after: $cursor){
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
        endCursor
        startCursor
      }
    }
  }`

export default class CustomDependenciesDropdown extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'selectedDependency': null,
      'menuVisible': false,
      'filterText': ''
    }

    this._hideMenu = this._hideMenu.bind(this)
  }

  /**
   * attach window listener evetns here
  */
  componentDidMount(){
    window.addEventListener('click', this._hideMenu)
  }
  /**
   * detach window listener evetns here
  */
  componentWillUnmount() {

    window.removeEventListener('click', this._hideMenu)
  }
  /*
  * @param {edge}
  * callback to add dependency
  */
  _addDependency(edge){
    this.props.addDependency(edge)
  }

  /* @param {edge}
  * callback to add dependency
  */
  _removeDependency(edge){
    this.props.removeDependency(edge)
  }
  /*
  * @param {edge}
  * shows menu by setting state
  */
  _showMenu(){
    if(navigator.onLine){
      this.setState({'menuVisible': true})
    } else {
      this.props.toggleContainer();
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Cannot add package at this time.`,
          messageBody: [{message: 'An internet connection is required to modify the environment.'}]
        }
      })
    }
  }
  /*
  * @param {}
  * hides menu by setting state
  */
  _hideMenu(evt){
    if(evt.target.className.indexOf('CustomDependenciesDropdown') < 0){
      this.setState({'menuVisible': false})
    }
  }
  /*
  * @param {customDependencies}
  * filtered drop down
  */
  _filterDropDown(customDependencies){
    let filteredCustomDependencies = customDependencies.filter((customDependency)=>{
      let customDependencyName = customDependency.node.name.toLowerCase()
      let filterText = this.state.filterText.toLowerCase()
      return (filterText === '') || (customDependencyName.indexOf(filterText) > -1)
    })

    return filteredCustomDependencies
  }

  /*
  * @param {evt}
  * set Filter Text
  */
  _setFilterText(evt){
    this.setState({filterText: evt.target.value})
  }

  render(){
    return(
      <QueryRenderer
        environment={environment}
        query={CustomDependenciesDropdownQuery}
        variables={
          {
            first: 20,
            cursor: null
          }
        }
        render={({error, props}) => {
            if(error){
              console.log(error)
              return (<div>{error.message}</div>)
            }
            else if(props){


              let menuCss = classNames({
                'CustomDependenciesDropdown__menu': true,
                'CustomDependenciesDropdown__menu--no-height': !this.state.menuVisible
              })

              let availableCustomDependencies = this._filterDropDown(props.availableCustomDependencies.edges)
              return (
                <div className="CustomDependenciesDropdown">
                  <div
                    className="CustomDependenciesDropdown__input-container"
                    onFocus={()=>{this._showMenu()}}>
                    <input

                      placeholder="Click or type to search custom dependencies"
                      onKeyUp={(evt)=> this._setFilterText(evt)}
                      className="CustomDependenciesDropdown__input"
                      type="text" />
                  </div>
                  <div className={menuCss}>

                    {
                      availableCustomDependencies.map((edge)=>{
                        return(
                        <CustomDependency
                          key={edge.node.id}
                          edge={edge}
                          self={this} />
                        )
                      })
                    }
                  </div>
                </div>)
            }else{
              return (<div></div>)
            }
          }
        }
      />
    )
  }
}

const CustomDependency = ({edge, self}) =>{
  return (
    <div
    className="CustomDependenciesDropdown__menu-row">
      <div>{edge.node.name}</div>
      <div>
        <button
          className="CustomDependenciesDropdown__button--round CustomDependenciesDropdown__button--add"
          onClick={()=>self._addDependency(edge)}>
        </button>
      </div>
  </div>)
}
