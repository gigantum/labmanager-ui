import React, { Component } from 'react'
import BaseImage from '../environment/BaseImage'
import CustomDependencies from '../environment/CustomDependencies'
import DevEnvironments from '../environment/DevEnvironments'
import PackageCount from './PackageCount'

import {
  createFragmentContainer,
  graphql
} from 'react-relay'

class Overview extends Component {
  constructor(props){
  	super(props);
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
                  <BaseImage
                    ref="baseImage"
                    environment={this.props.labbook.environment}
                    editVisible={false}
                    blockClass="Overview"
                  />
                </li>
                <li>
                  <DevEnvironments
                    ref="devEnvironments"
                    labbookName={this.props.labbookName}
                    environment={this.props.labbook.environment}
                    editVisible={false}
                    blockClass="Overview"
                  />
                </li>

              </ul>
            </div>
            <div>
              <PackageCount
                ref="packageCount"
                labbookName={this.props.labbookName}
              />
            </div>

        </div>
      )
    } else{
      return <div>loading</div>
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
      ...BaseImage_environment
      ...DevEnvironments_environment
      ...CustomDependencies_environment
    }
  }`
)
