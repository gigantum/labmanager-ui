import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay'
import environment from '../../createRelayEnvironment'
import { Link } from 'react-router-dom';
//import { browserHistory } from 'react-router'
//components
import DatasetSets from './datasets/DatasetSets';
import LabbookSets from './labbooks/LabbookSets';

export default class DatasetsLabbooksContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedComponent: props.match.params.id
    }
  }

  _setSelectedComponent(that, component){
    this.setState({selectedComponent: component})
    this.props.history.push(`../home/${component}`)
  }

  _displaySelectedComponent(){
    if(this.state.selectedComponent === 'datasets'){
      return <DatasetSets />
    }else{
      return (<QueryRenderer environment={environment} variables={{}} render={({error, props}) => {
            if (error) {
              return <div>{error.message}</div>
            } else if (props) {
              return <LabbookSets history={this.props.history} viewer={props.viewer} />
            }
            return <div>Loading</div>
          }}
        />)
    }
  }
  render() {

    return (
      <div className='datasets-labbooks__container flex flex-column'>
        <div className='datasets-labbooks__nav-container flex justify-center flex-0-0-auto'>
          <ul className='datasets-labbooks__nav flex flex--row justify--space-between'>
            <Link onClick={(t,event) => this._setSelectedComponent(this, 'datasets')} className={this.state.selectedComponent === 'datasets' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'} to='../home/datasets'>Datasets</Link>
            <Link onClick={(t, event) => this._setSelectedComponent(this, 'labbooks')} className={this.state.selectedComponent === 'labbooks' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'} to='../home/labbooks'>Labbooks</Link>
            {/* <li onClick={() => this.setSelectedComponent(this, 'datasets')} className={this.state.selectedComponent === 'datasets' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'}>Datasets</li>
            <li onClick={() => this.setSelectedComponent(this, 'labbooks')} className={this.state.selectedComponent === 'labbooks' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'}>Labbooks</li> */}
          </ul>
        </div>
        <div className='datasets-labbooks__view-container flex-1-0-auto'>
          {
            this._displaySelectedComponent()
          }
        </div>
      </div>
    )
  }
}
