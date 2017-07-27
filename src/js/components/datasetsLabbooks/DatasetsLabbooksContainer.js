import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay'
import environment from '../../createRelayEnvironment'
import { Link } from 'react-router-dom';
//components

import DatasetSets from './datasets/DatasetSets';
import LabbookSets from './labbooks/LabbookSets';

export default class DatasetsLabbooksContainer extends Component {
  constructor(props){
    console.log(props)
    super(props);
    this.state = {
      selectedComponent: props.match.params.id
    }
  }
  componentWillMount() {

  }

  setSelectedComponent(that, component){
    this.setState({selectedComponent: component})
  }

  displaySelectedComponent(){
    if(this.state.selectedComponent === 'datasets'){
      console.log(this.props)
      return <DatasetSets />
    }else{
      console.log(this.props)
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
            <Link onClick={() => this.setSelectedComponent(this, 'datasets')} className={this.state.selectedComponent === 'datasets' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'} to='../home/datasets'>Datasets</Link>
            <Link onClick={() => this.setSelectedComponent(this, 'labbooks')} className={this.state.selectedComponent === 'labbooks' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'} to='../home/labbooks'>Labbooks</Link>
            {/* <li onClick={() => this.setSelectedComponent(this, 'datasets')} className={this.state.selectedComponent === 'datasets' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'}>Datasets</li>
            <li onClick={() => this.setSelectedComponent(this, 'labbooks')} className={this.state.selectedComponent === 'labbooks' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'}>Labbooks</li> */}
          </ul>
        </div>
        <div className='datasets-labbooks__view-container flex-1-0-auto'>
          {
            this.displaySelectedComponent()
          }
        </div>
      </div>
    )
  }
}
