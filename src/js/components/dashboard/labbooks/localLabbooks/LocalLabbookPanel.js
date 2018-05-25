//vendor
import React, { Component } from 'react'
//muations
import StartContainerMutation from 'Mutations/StartContainerMutation'
import StopContainerMutation from 'Mutations/StopContainerMutation'
//store
import store from 'JS/redux/store'

/**
*  labbook panel is to only render the edge passed to it
*/

export default class LocalLabbookPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'exportPath': '',
      'status': '',
      'textStatus': '',
      'labbookName': props.edge.node.name,
      'owner': props.edge.node.owner
    }
    this._getContainerStatusText = this._getContainerStatusText.bind(this)
    this._stopStartContainer = this._stopStartContainer.bind(this)
  }

  componentWillMount() {
    const {environment} = this.props.edge.node
    let status = this._getContainerStatusText(environment.containerStatus, environment.imageStatus)

    this.setState({status: status, textStatus: status})

  }

  _getContainerStatusText(containerStatus, imageStatus){

    let status = 'Running';
    status = (containerStatus === 'NOT_RUNNING') ? 'Stopped' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;
    status = (imageStatus === "BUILD_FAILED") ? 'Rebuild' : status;
    status = (imageStatus === "DOES_NOT_EXIST") ? 'Rebuild' : status;

    return status;
  }
  /***
  * @param {string} status
  * fires when a componet mounts
  * adds a scoll listener to trigger pagination
  */
  _stopStartContainer(evt, status){
    evt.preventDefault()
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    if(status === "Stopped"){
      this._startContainerMutation()
    }else if(status === "Running"){
      this._stopContainerMutation()
    }else{
      store.dispatch({
        type: 'INFO_MESSAGE',
        payload:{
          message: `Container must be rebuilt. Open LabBook first and then try to run again.`
        }
      })
    }
  }
  /***
  * @param {string} status
  * starts labbook conatainer
  */
  _startContainerMutation(){
    let self = this;
    const {owner, labbookName} = this.state
    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Starting ${labbookName} container`
      }
    })
    this.setState({'status': 'Starting', textStatus: 'Starting'})
    StartContainerMutation(
      labbookName,
      owner,
      'clientMutationId',
      (response, error) =>{

        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem starting ${this.state.labbookName}, go to LabBook and try again`,
              messageBody: error
            }
          })
          self.setState({textStatus: "Stopped", status: "Stopped"})
        }else{
          self.props.history.replace(`../../labbooks/${owner}/${labbookName}`)
        }
      }
    )
  }
  /***
  * @param {string} status
  * stops labbbok conatainer
  */
  _stopContainerMutation(){
    const {owner, labbookName} = this.state
    let self = this
    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Stopping ${labbookName} container`
      }
    })
    this.setState({'status': 'Stopping', textStatus: 'Stopping'})

    StopContainerMutation(
      labbookName,
      owner,
      'clientMutationId',
      (response, error) =>{

        if(error){
          console.log(error)
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem stopping ${this.state.labbookName} container`,
              messageBody: error
            }
          })

          self.setState({textStatus: "Running", status: "Running"})
        }else{
          this.setState({'status': 'Stopped', textStatus: 'Stopped'})
        }

      }
    )
  }
  /***
  * @param {object,string} evt,status
  * stops labbbok conatainer
  ***/
  _updateTextStatusOver(evt, status){
    let newStatus = status;
    newStatus = (status === "Running") ? 'Stop' : newStatus;
    newStatus = (status === "Stopped") ? 'Run' : newStatus;
    this.setState({textStatus: newStatus})
  }
  /***
  * @param {objectstring} evt,status
  * stops labbbok conatainer
  ***/
  _updateTextStatusOut(evt, status){
    this.setState({textStatus: status})
  }

  render(){
    let edge = this.props.edge;
    let status = this.state.status
    let textStatus = this.state.textStatus

    return (
      <div
        onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner)}
        key={'local' + edge.node.name}
        className='LocalLabbooks__panel column-4-span-3 flex flex--column justify--space-between'>

        <div className="LocalLabbooks__icon-row">

          <div className="LocalLabbooks__containerStatus">
            <button
              onClick={(evt)=> this._stopStartContainer(evt, status)}
              onMouseOver={(evt)=> this._updateTextStatusOver(evt, status)}
              onMouseOut={(evt)=> this._updateTextStatusOut(evt, status)}
              className={`LocalLabbooks__containerStatus--state ${status}`}>
              {textStatus}
            </button>
          </div>
        </div>

        <div className="LocalLabbooks__text-row">
          <div className="LocalLabbooks__title-row">
            <h6
              className="LocalLabbooks__panel-title"
              onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner)}>
              {edge.node.name}
            </h6>

          </div>
          <p className="LocalLabbooks__owner">{'Created by ' + edge.node.owner}</p>
          <p
            className="LocalLabbooks__description">
            {edge.node.description}
          </p>
        </div>
    </div>)
  }
}
