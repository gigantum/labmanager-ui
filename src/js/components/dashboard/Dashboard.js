import React, { Component } from 'react';
import {graphql, QueryRenderer} from 'react-relay'
//components
import DatasetSets from './datasets/DatasetSets';
import LocalLabbooks from './labbooks/LocalLabbooks';
import environment from 'JS/createRelayEnvironment'
import WizardModal from 'Components/wizard/WizardModal'


const LabbookQuery = graphql`query DashboardQuery($first: Int!, $cursor: String){
    ...LocalLabbooks_feed
}`

export default class DashboardContainer extends Component {
  constructor(props){

    super(props);
    this.state = {
      selectedComponent: props.match.params.id
    }
  }
  /**
  *  @param {Object} nextProps
  *  update select component before component renders
  */
  componentWillReceiveProps(nextProps){
    this.setState({
      selectedComponent: nextProps.match.params.id
    })
  }

  /**
  *  @param {}
  *  returns jsx of selected component
  *  @return {jsx}
  */
  _displaySelectedComponent(){

    if(this.state.selectedComponent === 'datasets'){

      return (<DatasetSets />)
    }else{

      return (<QueryRenderer
        environment={environment}
        query={LabbookQuery}
        variables={{
          first: 20,
          cursor: null
        }}
        render={({error, props}) => {

          if (error) {

            return <div>{error.message}</div>
          } else if (props) {

              return (
                <LocalLabbooks feed={props} history={this.props.history} />
              )

          }else{

            return (
              <div>
                <WizardModal
                  handler={this.handler}
                  history={this.props.history}
                  {...this.props}
                />
              </div>
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
