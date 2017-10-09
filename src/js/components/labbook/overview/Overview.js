//vendor
import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
//components
import BaseImage from 'Components/labbook/environment/BaseImage'
import DevEnvironments from 'Components/labbook/environment/DevEnvironments'
import PackageCount from './PackageCount'
import Loader from 'Components/shared/Loader'


class Overview extends Component {

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
      ...BaseImage_environment
      ...DevEnvironments_environment
      ...CustomDependencies_environment
    }
  }`
)
