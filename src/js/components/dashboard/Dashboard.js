import React, { Component } from 'react';
import {graphql, QueryRenderer} from 'react-relay'
//components
import DatasetSets from './datasets/DatasetSets';
import LocalLabbooks from './labbooks/LocalLabbooks';
import environment from 'JS/createRelayEnvironment'
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'


const LabbookQuery = graphql`query DashboardQuery($first: Int!, $cursor: String, $sort: String $reverse: Boolean){
    ...LocalLabbooks_feed
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
    // this._modifyQuery = this._modifyQuery.bind(this)
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
          query={LabbookQuery}
          variables={{
            first: 20,
            cursor: null,
            sort: 'modified_on',
            reverse: false,
          }}
          render={({error, props}) => {
            if (props && props.localLabbooks === null) {
              return <div>There was an error attempting to fetch LabBooks.</div>
            } else if (props) {

                return (
                  <LocalLabbooks
                    feed={props}
                    history={this.props.history}
                  />
                )

            }else{
              return (
                <Loader />
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
