import React, { Component } from 'react';
import {graphql, QueryRenderer} from 'react-relay'
import queryString from 'querystring'
//components
import DatasetSets from './datasets/DatasetSets';
import LocalLabbooksContainer from './labbooks/localLabbooks/LocalLabbooksContainer';
import RemoteLabbooksContainer from './labbooks/remoteLabbooks/RemoteLabbooksContainer';
import environment from 'JS/createRelayEnvironment'
//store
import store from "JS/redux/store"

const LocalListingQuery = graphql`query DashboardLocalQuery($first: Int!, $cursor: String, $sort: String $reverse: Boolean){
  ...LocalLabbooksContainer_labbookList
}`

const RemoteListingQuery = graphql`query DashboardRemoteQuery($first: Int!, $cursor: String, $sort: String $reverse: Boolean){
  ...RemoteLabbooksContainer_labbookList
}`

export default class DashboardContainer extends Component {
  constructor(props){
    super(props);
    let {sort, reverse} = queryString.parse(this.props.history.location.search.slice(1))
    reverse = reverse === 'true'
    this.state = {
      selectedComponent: props.match.params.id,
      sort: sort || 'modified_on',
      reverse: reverse || false,
    }
    store.dispatch({
      type: 'UPDATE_CALLBACK_ROUTE',
      payload: {
        'callbackRoute': props.history.location.pathname
      }
    })
    this._refetchSort = this._refetchSort.bind(this)
  }
  /**
  *  @param {Object} nextProps
  *  update select component before component renders
  */
  componentWillReceiveProps(nextProps){
    this.setState({
      selectedComponent: nextProps.match.params.id
    })
    store.dispatch({
      type: 'UPDATE_CALLBACK_ROUTE',
      payload: {
        'callbackRoute': nextProps.history.location.pathname
      }
    })
  }

  /**
    * @param {string, boolean} sort, reverse
    * sets state of sort and reverse, passed to child components
  */
  _refetchSort(sort, reverse) {
    if(this.state.sort !== sort || this.state.reverse !== reverse){
      this.setState({sort, reverse})
    }
  }



  /**
  *  @param {}
  *  returns jsx of selected component
  *  @return {jsx}
  */
  _displaySelectedComponent(){
    if(this.state.selectedComponent === 'datasets'){

      return (
        <DatasetSets/>)
    }else{
      let paths = this.props.history.location.pathname.split('/')
      let sectionRoute = paths.length > 2 ?  paths[2] : 'local'
      if(paths[2] !== 'cloud' && paths[2] !== 'local'){
        this.props.history.replace(`../labbooks/local`)
      }

      return (
        <QueryRenderer
          environment={environment}
          query={sectionRoute === 'cloud' ? RemoteListingQuery : LocalListingQuery }
          variables={{
            first: 100,
            cursor: null,
            sort: this.state.sort,
            reverse: this.state.reverse,
          }}
          render={({error, props}) => {
            if (error) {
              console.log(error)
            } else if (props) {
              if (sectionRoute === 'cloud'){
                return (
                  <RemoteLabbooksContainer
                    auth={this.props.auth}
                    labbookList={props}
                    history={this.props.history}
                    refetchSort={this._refetchSort}
                  />
                )
              } else {
                return (
                  <LocalLabbooksContainer
                    auth={this.props.auth}
                    labbookList={props}
                    history={this.props.history}
                    refetchSort={this._refetchSort}
                  />
                )
              }
            }else{
              return (
                <LocalLabbooksContainer
                  auth={this.props.auth}
                  labbookList={props}
                  history={this.props.history}
                  section={sectionRoute}
                  refetchSort={this._refetchSort}
                  loading
                />
              )
            }
          }}
        />
      )

      }
  }
  render() {

    return (
      <div className='Dashboard flex flex-column'>

        <div className='Dashboard__view flex-1-0-auto'>
          {
            this._displaySelectedComponent()
          }
        </div>
      </div>
    )
  }
}
