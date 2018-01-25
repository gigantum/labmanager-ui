//vendor
import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
//components
import Base from 'Components/labbook/environment/Base'
import DevEnvironments from 'Components/labbook/environment/DevEnvironments'
import PackageCount from './PackageCount'
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'

let unsubscribe;

class Overview extends Component {
  constructor(props){
    super(props)

    this._openJupyter = this._openJupyter.bind(this)

    this.state = store.getState().overview

  }
  /*
    subscribe to store to update state
  */
  componentDidMount() {
    unsubscribe = store.subscribe(() =>{
      this.storeDidUpdate(store.getState().overview)
    })
  }
  /*
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()
  }
  /*
    @param {object} overview
    updates components state
  */
  storeDidUpdate = (overview) => {
    if(this.state !== overview){
      this.setState(overview);//triggers re-render when store updates
    }
  }

  _openJupyter(){
    window.open('http://localhost:8888', '_blank')
  }
  render(){

    if(this.props.labbook){

      return(
        <div className="Overview">
            <div className="Overview__description">
              <p>{this.props.description}</p>
            </div>
            <h4 className="Overview__title">Environment</h4>
            <div className="Overview__environment">
              <ul className="Overview__environment-list flex flex--row">
                <li>
                  <Base
                    ref="base"
                    environment={this.props.labbook.environment}
                    editVisible={false}
                    blockClass="Overview"
                  />
                </li>
                <li>
                  <div className="flex flex--row">
                    <DevEnvironments
                      ref="devEnvironments"
                      labbookName={this.props.labbookName}
                      environment={this.props.labbook.environment}
                      editVisible={false}
                      blockClass="Overview"
                    />
                    {

                      (this.state.containerStates[this.props.labbookId] === 'Open') &&
                      <div className="Overview__open-jupyter-container">
                        <button
                          className="Overview__open-jupyter"
                          onClick={()=> this._openJupyter()}>
                          Open Jupyter
                        </button>
                    </div>
                    }
                  </div>
                </li>

              </ul>
            </div>
            <div>
              <PackageCount
                ref="packageCount"
              />
            </div>

        </div>
      )
    } else{
      return (<Loader />)
    }
  }
}


export default createFragmentContainer(
  Overview,
  graphql`fragment Overview_labbook on Labbook {
    environment{
      id
      imageStatus
      containerStatus
      ...Base_environment
      ...CustomDependencies_environment
    }
  }`
)
