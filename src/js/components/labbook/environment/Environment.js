// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
// components
import Loader from 'Components/shared/Loader';
import Base from './Base';
import PackageDependencies from './PackageDependencies';
import CustomDockerfile from './CustomDockerfile';
import ErrorBoundary from 'Components/shared/ErrorBoundary';
import ToolTip from 'Components/shared/ToolTip';
// mutations
import BuildImageMutation from 'Mutations/BuildImageMutation';
import StopContainerMutation from 'Mutations/StopContainerMutation';
// store
import { setErrorMessage } from 'JS/redux/reducers/footer';
import { setRefetchPending } from 'JS/redux/reducers/labbook/environment/packageDependencies';
import store from 'JS/redux/store';
// assets
import './Environment.scss';

class Environment extends Component {
  constructor(props) {
  	super(props);
    const { owner, labbookName } = store.getState().routes;

    this.state = {
      modal_visible: false,
      readyToBuild: false,
      show: false,
      message: '',
      owner,
      labbookName,
    };

    this._buildCallback = this._buildCallback.bind(this);
    this._setBase = this._setBase.bind(this);
  }

  /**
  *  @param {None}
  *  callback that triggers buildImage mutation
  */
  _buildCallback = (refetchPending) => {
    const { labbookName, owner } = this.state;
    this.props.setBuildingState(true);
    if (store.getState().containerStatus.status === 'Running') {
      StopContainerMutation(
        labbookName,
        owner,
        'clientMutationId',
        (response, error) => {
          if (error) {
            console.log(error);
            setErrorMessage(`Problem stopping ${labbookName}`, error);
          } else {
            BuildImageMutation(
              labbookName,
              owner,
              false,
              (response, error) => {
                if (error) {
                  setErrorMessage(`${labbookName} failed to build`, error);
                }

                if (refetchPending) {
                  setRefetchPending(true);
                }

                return 'finished';
              },
            );
          }
        },
      );
    } else {
      BuildImageMutation(
        labbookName,
        owner,
        false,
        (response, error) => {
          if (error) {
            setErrorMessage(`${labbookName} failed to build`, error);
          }

          if (refetchPending) {
            setRefetchPending(true);
          }


          return 'finished';
        },
      );
    }
  }

  /**
  *  @param {Obect}
  *  sets readyToBuild state to true
  */
  _setBase(base) {
    this.setState({ readyToBuild: true });
  }

  render() {
    if (this.props.labbook) {
      const env = this.props.labbook.environment;
      const { base } = env;
      return (
        <div className="Environment">
          <div className="Base__headerContainer">
            <h5 className="Base__header">Base&nbsp;&nbsp;&nbsp; <ToolTip section="baseEnvironment" /></h5>
          </div>
          <ErrorBoundary type="baseError" key="base">
            <Base
              ref="base"
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              editVisible
              containerStatus={this.props.containerStatus}
              setComponent={this._setComponent}
              setBase={this._setBase}
              buildCallback={this._buildCallback}
              blockClass="Environment"
              base={base}
            />
          </ErrorBoundary>
          <div className="Environment__headerContainer">
            <h5 className="PackageDependencies__header">Packages <ToolTip section="packagesEnvironment" /></h5>
          </div>
          <ErrorBoundary type="packageDependenciesError" key="packageDependencies">
            <PackageDependencies
              componentRef={ref => this.packageDependencies = ref}
              environment={this.props.labbook.environment}
              environmentId={this.props.labbook.environment.id}
              labbookId={this.props.labbook.id}
              containerStatus={this.props.containerStatus}
              setBase={this._setBase}
              setComponent={this._setComponent}
              buildCallback={this._buildCallback}
              overview={this.props.overview}
              base={base}
              isLocked={this.props.isLocked}
            />
          </ErrorBoundary>
          <CustomDockerfile
            dockerfile={this.props.labbook.environment.dockerSnippet}
            buildCallback={this._buildCallback}
            isLocked={this.props.isLocked}
          />
        </div>
      );
    }
    return (
      <Loader />
    );
  }
}

export default createFragmentContainer(
  Environment,
  graphql`fragment Environment_labbook on Labbook {
    environment{
      id
      imageStatus
      containerStatus
      base{
        developmentTools
        packageManagers
      }
      dockerSnippet

      ...Base_environment
      ...PackageDependencies_environment
    }
  }`,
);
