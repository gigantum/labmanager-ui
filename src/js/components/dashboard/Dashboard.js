import React, { Component } from 'react';
import {graphql, QueryRenderer} from 'react-relay'
//components
import DatasetSets from './datasets/DatasetSets';
import Labbooks from './labbooks/Labbooks';
import environment from 'JS/createRelayEnvironment'
import Loader from 'Components/shared/Loader'
//store
import store from "JS/redux/store"

const LabbookListingQuery = graphql`query DashboardQuery($first: Int!, $cursor: String, $sort: String $reverse: Boolean){
  ...Labbooks_labbookList
}`

export default class DashboardContainer extends Component {
  constructor(props){

    super(props);
    this.state = {
      selectedComponent: props.match.params.id,
    }
    store.dispatch({
      type: 'UPDATE_CALLBACK_ROUTE',
      payload: {
        'callbackRoute': props.history.location.pathname
      }
    })
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
  *  @param {}
  *  returns jsx of selected component
  *  @return {jsx}
  */
  _displaySelectedComponent(){

    if(this.state.selectedComponent === 'datasets'){

      return (
        <DatasetSets/>)
    }else{

      return (
        <QueryRenderer
          environment={environment}
          query={LabbookListingQuery}
          variables={{
            first: 20,
            cursor: null,
            sort: 'modified_on',
            reverse: false,
          }}
          render={({error, props}) => {
            if (error) {
              console.log(error)
            } else if (props) {
                return (
                  <Labbooks
                    auth={this.props.auth}
                    labbookList={props}
                    history={this.props.history}
                  />
                )
            }else{
              return (
                <Labbooks
                  auth={this.props.auth}
                  labbookList={props}
                  history={this.props.history}
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
