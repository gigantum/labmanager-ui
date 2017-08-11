import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {graphql, QueryRenderer} from 'react-relay'
//components
import DatasetSets from './datasets/DatasetSets';
import LocalLabbooks from './labbooks/LocalLabbooks';
import environment from './../../createRelayEnvironment'
import WizardModal from './../wizard/WizardModal'


const LabbookQuery = graphql`query DashboardQuery($first: Int!, $cursor: String){
  localLabbooks(first:$first, after: $cursor){
    ...LocalLabbooks_localLabbooks
  }
}`

export default class DashboardContainer extends Component {
  constructor(props){

    super(props);
    this.state = {
      selectedComponent: props.match.params.id
    }
  }

  _setSelectedComponent(that, component){
    this.setState({selectedComponent: component})
    this.props.history.push(`../${component}`)
  }

  _displaySelectedComponent(){
    if(this.state.selectedComponent === 'datasets'){

      return (<DatasetSets />)
    }else{

      return (<QueryRenderer
        environment={environment}
        query={LabbookQuery}
        variables={{
          first: 10,
          cursor: null
        }}
        render={({error, props, adsdas}) => {

          if (error) {
            console.log(error)
            return <div>{error.message}</div>
          } else if (props) {

              return (
                <LocalLabbooks data={props.data} localLabbooks={props.localLabbooks} history={this.props.history} {...props}/>
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
        <div className='Dashboard__nav-container flex justify-center flex-0-0-auto'>
          <ul className='Dashboard__nav flex flex--row justify--space-between'>
            <li>
              <Link
                onClick={(t,event) => this._setSelectedComponent(this, 'datasets')}
                className={this.state.selectedComponent === 'datasets' ? 'Dashboard__nav-item selected': 'Dashboard__nav-item'}
                to='../datasets'
              >
                Datasets
              </Link>
            </li>
            <li>
              <Link
                onClick={(t, event) => this._setSelectedComponent(this, 'labbooks')}
                className={this.state.selectedComponent === 'labbooks' ? 'Dashboard__nav-item selected': 'Dashboard__nav-item'}
                to='../labbooks'
              >
                Labbooks
              </Link>
            </li>

          </ul>
        </div>
        <div className='Dashboard__view flex-1-0-auto'>
          {
            this._displaySelectedComponent()
          }
        </div>
      </div>
    )
  }
}
