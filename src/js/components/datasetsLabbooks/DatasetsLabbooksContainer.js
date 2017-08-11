import React, { Component } from 'react'

export default class DatasetsLabbooksContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedComponent: 'datasets'
    }
  }
  componentWillMount() {
;
  }

  setSelectedComponent(that, component){
    this.setState({selectedComponent: component})
  }
  render() {

    return (

      <div className='datasets-labbooks__container flex justify-center'>
        <ul className='datasets-labbooks__nav flex flex--row justify--space-between'>
          <li onClick={() => this.setSelectedComponent(this, 'datasets')} className={this.state.selectedComponent === 'datasets' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'}>Datasets</li>
          <li onClick={() => this.setSelectedComponent(this, 'labbooks')} className={this.state.selectedComponent === 'labbooks' ? 'datasets-labbooks__nav-item selected': 'datasets-labbooks__nav-item'}>Labbooks</li>
        </ul>

        {
          //(this.state.selectedComponent === 'datasets') ? return(<div> datasets </div>) : return(<div> labboks </div>)
        }
      </div>
    )
  }
}
