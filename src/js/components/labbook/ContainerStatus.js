//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
//mutations
import StopContainerMutation from 'Mutations/StopContainerMutation'
import StartContainerMutation from 'Mutations/StartContainerMutation'
import environment from 'JS/createRelayEnvironment'

const containerStatusQuery = graphql`
  query ContainerStatusQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    id
    description
    environment{
      containerStatus
      imageStatus
    }
    notes(first: $first){
      edges{
        node{
          id
        }
      }
    }
  }
}
`

let tempStatus;

export default class ContainerStatus extends Component {
  constructor(props){
  	super(props);
    this.state = {
      'status': "",
      'building': this.props.isBuilding ? true : false,
      'secondsElapsed': 0,
      'containerStatus': props.containerStatus,
      'imageStatus': props.imageStatus
    }
    tempStatus = "Closed";

    this._tick = this._tick.bind(this)
    this._checkJupyterStatus = this._checkJupyterStatus.bind(this)
    this._getContainerStatusText = this._getContainerStatusText.bind(this)
    this._openCloseContainer =  this._openCloseContainer.bind(this)
  }
  /**
  *  @param {}
  *  set containerStatus secondsElapsed state by iterating
  *  @return {string}
  */
  _tick = () => {
    this.setState({secondsElapsed: this.state.secondsElapsed + 1});
  }
  /**
  *  @param {}
  *  set tick interval
  *  @return {string}
  */
  componentDidMount(){
    this.interval = setInterval(this._tick, 2000);
  }
  /**
  *  @param {string} nextProps
  *  update container state before rendering new props
  */
  componentWillReceiveProps(nextProps) {

    this.setState({
      'containerStatus': nextProps.containerStatus,
      'imageStatus': nextProps.imageStatus
    })
  }
  /**
  *  @param {}
  *  clear interval to stop polling and clean up garbage
  */
  componentWillUnmount() {
    //memory clean up
    clearInterval(this.interval);
  }

  /**
    @param {}
    set containerStatus secondsElapsed state by iterating
    @return {string}
  */
  _checkJupyterStatus = () => {
    //update this when juphyter can accept cors

    setTimeout(function(){
      window.open('http://localhost:8888', '_blank')
    },5000)
  }
  /**
    @param {string, string} containerStatus,imageStatus -
    get status by mixing containrSatus imagesStatus and state.status
    @return {string}
  */
  _getContainerStatusText = ({containerStatus, imageStatus}) => {

    let status = (containerStatus === 'RUNNING') ? 'Open' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Closed' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;

    status = ((status === 'Closed') && (this.state.status === "Starting")) ? "Starting" : status;
    status = ((status === 'Open') && (this.state.status === "Stopping")) ? "Stopping" : status;

    tempStatus = status

    return status;
  }
  /**
    @param {string} labbookName -
    triggers stop container mutation
  */
  _stopContainerMutation(labbookName){
    const username = localStorage.getItem('username')
    StopContainerMutation(
      labbookName,
      username,
      'clientMutationId',
      (error) =>{
        if(error){

          console.log(error)
        }else{
          console.log('stopped container')
        }

      }
    )
  }

  /**
    @param {string} labbookName -
    triggers start container mutation
  */
  _startContainerMutation(labbookName){
    const username = localStorage.getItem('username')
    StartContainerMutation(
      labbookName,
      username,
      'clientMutationId',
      (error) =>{
        if(error){
          console.log(error)
        }else{
          console.log('stopped container')
        }
      }
    )
  }

  /**
    @param {object, string} event,status -
    trigger mutatuion to stop or start container depdending on the state
  */
  _openCloseContainer = (evt, status) =>{

      if(status === 'Open'){

        this.setState({status: 'Stopping'});
        this._stopContainerMutation(this.props.labbookName)

      }else if(status === 'Closed'){

        this.setState({status: 'Starting'})
        this._startContainerMutation(this.props.labbookName)

      }else{
        console.log('container is mutating')
      }
  }

  render(){
    const username = localStorage.getItem('username')
    return(
      <QueryRenderer
        variables={{
          'owner': username,
          'name': this.props.labbookName,
          'first': Math.floor(Math.random() * 10000)
          }
        }
        environment={environment}
        query={containerStatusQuery}
        render={({error, props}) => {

          if(error){
            console.error(error)
            return(this._erroMessage(error))
          }else if(props){

            let status = this._getContainerStatusText(props.labbook.environment)
            return(this._containerStatus(status, 'setStatus')
            )
          } else{

            let status = this._getContainerStatusText(this.state)

            return (this._containerStatus(status, 'tempStatus'))
          }
        }
      }

      />
    )
  }

  _containerStatus(status, key){
    return(
      <div className="ContainerStatus flex flex--column">
        <div
          onClick={(evt) => this._openCloseContainer(evt, status)}
          key={key}
          className={'ContainerStatus__container-state ' + ((this.props.isBuilding) ? 'Building' : status)}>
          {this.props.isBuilding ? 'Building' : status}
        </div>
      </div>)
  }

  _errorMessage(error){
      return(<div>{error.message}</div>)
  }
}
