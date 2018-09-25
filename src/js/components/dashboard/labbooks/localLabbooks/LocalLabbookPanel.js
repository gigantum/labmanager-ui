// vendor
import React, { Component } from 'react';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
// muations
import StartContainerMutation from 'Mutations/StartContainerMutation';
import StopContainerMutation from 'Mutations/StopContainerMutation';
// store
import { setErrorMessage, setInfoMessage } from 'JS/redux/reducers/footer';
import store from 'JS/redux/store';
// assets
import './LocalLabbookPanel.scss';
/**
*  labbook panel is to only render the edge passed to it
*/

export default class LocalLabbookPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exportPath: '',
      status: 'loading',
      textStatus: '',
      labbookName: props.edge.node.name,
      owner: props.edge.node.owner,
    };
    this._getContainerStatusText = this._getContainerStatusText.bind(this);
    this._stopStartContainer = this._stopStartContainer.bind(this);
  }
  /** *
  * @param {Object} nextProps
  * processes container lookup and assigns container status to labbook card
  */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { environment } = nextProps.node;
    if (environment) {
      const status = this._getContainerStatusText(environment.containerStatus, environment.imageStatus);

      this.setState({ status, textStatus: status });
    }
  }
  /** *
  * @param {}
  * if environment exists when components will mount it will populate container status
  */
  UNSAFE_componentWillMount() {
    const { environment } = this.props.node;
    if (environment) {
      const status = this._getContainerStatusText(environment.containerStatus, environment.imageStatus);

      this.setState({ status, textStatus: status });
    }
  }
  /** *
  * @param {string, string} containerStatus, imageStatus
  * returns corrent container status by checking both container and imagestatus
  */
  _getContainerStatusText(containerStatus, imageStatus) {
    let status = 'Running';
    status = (containerStatus === 'NOT_RUNNING') ? 'Stopped' : status;
    status = (imageStatus === 'BUILD_IN_PROGRESS') ? 'Building' : status;
    status = (imageStatus === 'BUILD_FAILED') ? 'Rebuild' : status;
    status = (imageStatus === 'DOES_NOT_EXIST') ? 'Rebuild' : status;

    return status;
  }
  /** *
  * @param {string} status
  * fires when a componet mounts
  * adds a scoll listener to trigger pagination
  */
  _stopStartContainer(evt, status) {
    evt.preventDefault();
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    if (status === 'Stopped') {
      this._startContainerMutation();
    } else if (status === 'Running') {
      this._stopContainerMutation();
    } else if (status === 'loading') {
      setInfoMessage('Container status is still loading. The status will update when it is available.');
    } else if (status === 'Building') {
      setInfoMessage('Container is still building and the process may not be interrupted.');
    } else {
      setInfoMessage('Container must be rebuilt. Open Project first and then try to run again.');
    }
  }
  /** *
  * @param {string} status
  * starts labbook conatainer
  */
  _startContainerMutation() {
    const self = this;

    const { owner, labbookName } = this.state;
    setInfoMessage(`Starting ${labbookName} container`);
    this.setState({ status: 'Starting', textStatus: 'Starting' });

    StartContainerMutation(
      labbookName,
      owner,
      'clientMutationId',
      (response, error) => {
        if (error) {
          setErrorMessage(`There was a problem starting ${this.state.labbookName}, go to Project and try again`, error);
          self.setState({ textStatus: 'Stopped', status: 'Stopped' });
        } else {
          self.props.history.replace(`../../projects/${owner}/${labbookName}`);
        }
      },
    );
  }
  /** *
  * @param {string} status
  * stops labbbok conatainer
  */
  _stopContainerMutation() {
    const { owner, labbookName } = this.state;

    const self = this;
    setInfoMessage(`Stopping ${labbookName} container`);
    this.setState({ status: 'Stopping', textStatus: 'Stopping' });

    StopContainerMutation(
      labbookName,
      owner,
      'clientMutationId',
      (response, error) => {
        if (error) {
          console.log(error);
          setErrorMessage(`There was a problem stopping ${this.state.labbookName} container`, error);
          self.setState({ textStatus: 'Running', status: 'Running' });
        } else {
          this.setState({ status: 'Stopped', textStatus: 'Stopped' });
        }
      },
    );
  }
  /** *
  * @param {object,string} evt,status
  * stops labbbok conatainer
  ** */
  _updateTextStatusOver(evt, status) {
    let newStatus = status;

    if (status !== 'loading') {
      newStatus = (status === 'Running') ? 'Stop' : newStatus;
      newStatus = (status === 'Stopped') ? 'Run' : newStatus;
      this.setState({ textStatus: newStatus });
    }
  }
  /** *
  * @param {objectstring} evt,status
  * stops labbbok conatainer
  ** */
  _updateTextStatusOut(evt, status) {
    if (status !== 'loading') {
      this.setState({ textStatus: status });
    }
  }

  render() {
    const edge = this.props.edge;
    const status = this.state.status;
    const textStatus = this.state.textStatus;


    return (
      <Link
        to={`/projects/${edge.node.owner}/${edge.node.name}`}
        onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner)}
        key={`local${edge.node.name}`}
        className="Card Card--text column-4-span-3 flex flex--column justify--space-between"
      >

        <div className="LocalLabbooks__row--icons">

          <div className="LocalLabbooks__containerStatus">

            <button
              onClick={evt => this._stopStartContainer(evt, status)}
              onMouseOver={evt => this._updateTextStatusOver(evt, status)}
              onMouseOut={evt => this._updateTextStatusOut(evt, status)}
              className={`ContainerStatus__container-state LocalLabbooks__containerStatus--state ${status} box-shadow`}
            >
              {textStatus}
            </button>

          </div>

        </div>

        <div className="LocalLabbooks__row--text">

          <div>

            <h6
              className="LocalLabbooks__panel-title"
              onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner)}
            >

              <Highlighter
                highlightClassName="LocalLabbooks__highlighted"
                searchWords={[store.getState().labbookListing.filterText]}
                autoEscape={false}
                caseSensitive={false}
                textToHighlight={edge.node.name}
              />

            </h6>

          </div>

          <p className="LocalLabbooks__paragraph LocalLabbooks__paragraph--owner ">{`Created by ${edge.node.owner}`}</p>

          <p
            className="LocalLabbooks__paragraph LocalLabbooks__paragraph--description"
          >

            <Highlighter
              highlightClassName="LocalLabbooks__highlighted"
              searchWords={[store.getState().labbookListing.filterText]}
              autoEscape={false}
              caseSensitive={false}
              textToHighlight={edge.node.description}
            />

          </p>

        </div>

        { !(this.props.visibility === 'local') &&
          <div
            data-tooltip={`${this.props.visibility}`}
            className={`Tooltip LocalLabbookPanel__${this.props.visibility}`}
          />
        }
      </Link>);
  }
}
