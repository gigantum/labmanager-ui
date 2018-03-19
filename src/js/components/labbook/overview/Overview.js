//vendor
import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
import {Link} from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import classNames from 'classnames'
//components
import Base from 'Components/labbook/environment/Base'
import FilePreview from './FilePreview'
import RecentActivity from './RecentActivity'
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'
//config
import config from 'JS/config'

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
    let recentActivity = null,
        environment = null,
        overview = null;
    let textCSS = classNames({
      'Overview__description': this.props.description !== null ,
      'Overview__description loading-text loading': this.props.description === null
    });
    if(this.props.labbook){
      recentActivity = this.props.labbook.overview.recentActivity;
      environment = this.props.labbook.environment;
      overview = this.props.labbook.overview;
    }
    const {owner, labbookName} = this.state = store.getState().routes
    console.log(config.placeholderText)
    console.log(this.props.description)
    return(
      <div className="Overview">
          <div className="Overview__title-container">
            <h5 className="Overview__title">Overview</h5>
          </div>
          <div className={textCSS}>
            <ReactMarkdown source={this.props.description !== null ? this.props.description: config.placeholderText} />
          </div>
          <div>
            <RecentActivity recentActivity={recentActivity}/>
          </div>
          <div className="Overview__title-container">
            <h5 className="Overview__title">Environment</h5>
            <Link
              to={{pathname: `../../../../labbooks/${owner}/${labbookName}/environment`}}
              replace
            >
              Environment Details >
            </Link>
          </div>
          <div className="Overview__environment">
              <Base
                ref="base"
                environment={environment}
                blockClass="Overview"
                overview={overview}
              />
          </div>

          <div>
            <FilePreview
              ref="filePreview"
            />
          </div>


      </div>
    )
  }
}


export default createFragmentContainer(
  Overview,
  graphql`fragment Overview_labbook on Labbook {
    overview{
      id
      owner
      name
      numAptPackages
      numConda2Packages
      numConda3Packages
      numPipPackages
      numCustomDependencies
      recentActivity{
        id
        owner
        name
        message
        detailObjects {
          id
          data
        }
        type
        timestamp
        username
        email
      }
      remoteUrl
    }
    environment{
      id
      imageStatus
      containerStatus
      ...Base_environment
      ...CustomDependencies_environment
    }
  }`
)
