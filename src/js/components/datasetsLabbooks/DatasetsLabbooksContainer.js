import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
    this.props.history.push(`../${component}`)
  }

  _displaySelectedComponent(){
    if(this.state.selectedComponent === 'datasets'){

      return (<DatasetSets />)
    }else{

      return ( <LabbookSets history={this.props.history} />)

    }
  }
  render() {

    return (
      <div className='DatasetsLabbooks flex flex-column'>
        <div className='DatasetsLabbooks__nav-container flex justify-center flex-0-0-auto'>
          <ul className='DatasetsLabbooks__nav flex flex--row justify--space-between'>

            <Link
              onClick={(t,event) => this._setSelectedComponent(this, 'datasets')}
              className={this.state.selectedComponent === 'datasets' ? 'DatasetsLabbooks__nav-item selected': 'DatasetsLabbooks__nav-item'}
              to='../datasets'
            >
              Datasets
            </Link>
            <Link
              onClick={(t, event) => this._setSelectedComponent(this, 'labbooks')}
              className={this.state.selectedComponent === 'labbooks' ? 'DatasetsLabbooks__nav-item selected': 'DatasetsLabbooks__nav-item'}
              to='../labbooks'
            >
              Labbooks
            </Link>

          </ul>
        </div>
        <div className='DatasetsLabbooks__view flex-1-0-auto'>
          {
            this._displaySelectedComponent()
          }
        </div>
      </div>
    )
  }
}
