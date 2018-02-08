//vendor
import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
import ReactMarkdown from 'react-markdown'
//components
import Base from 'Components/labbook/environment/Base'
import PackageCount from './PackageCount'
import FilePreview from './FilePreview'
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
            <h5 className="Overview__title">Overview</h5>
            <div className="Overview__description">
              <ReactMarkdown source={this.props.description} />
            </div>
            <h5 className="Overview__title">Environment</h5>
            <div className="Overview__environment">
                <Base
                  ref="base"
                  environment={this.props.labbook.environment}
                  blockClass="Overview"
                />
            </div>
            <div>
              <PackageCount
                ref="packageCount"
              />
            </div>

            <div>
              <FilePreview
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
