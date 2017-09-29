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

let containerStatus;

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
    tempStatus = "Closed"
    containerStatus = this;
  }

  tick(){
    containerStatus.setState({secondsElapsed: containerStatus.state.secondsElapsed + 1});
  }

  componentDidMount(){
    this.interval = setInterval(this.tick, 2000);
  }

  componentWillReceiveProps(nextProps) {

    this.setState({
      'containerStatus': nextProps.containerStatus,
      'imageStatus': nextProps.imageStatus
    })
  }

  componentWillUnmount() {
    //memory clean up
    clearInterval(this.interval);
  }


  _checkJupyterStatus(){
    //update this when juphyter can accept cors

    setTimeout(function(){
      window.open('http://localhost:8888', '_blank')
    },5000)
  }


  _getContainerStatusText(containerStatus, imageStatus){

    let status = (containerStatus === 'RUNNING') ? 'Open' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Closed' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;

    status = ((status === 'Closed') && (this.state.status === "Starting")) ? "Starting" : status;
    status = ((status === 'Open') && (this.state.status === "Stopping")) ? "Stopping" : status;

    tempStatus = status

    return status;
  }

  _openCloseContainer(evt, status){

      if(status === 'Open'){

        this.setState({status: 'Stopping'});
        StopContainerMutation(
          this.props.labbookName,
          'default',
          'clientMutationId',
          (error) =>{
            if(error){

              console.log(error)
            }else{
              console.log('stopped container')
            }

          }
        )

      }else if(status === 'Closed'){

        this.setState({status: 'Starting'})
        StartContainerMutation(
          this.props.labbookName,
          'default',
          'clientMutationId',
          (error, response) =>{

            if(error){
              console.log(error)
            }else{
              this._checkJupyterStatus()
            }

            }
        )
      }else{
        console.log('container is mutating')
      }
  }

  render(){

    return(
      <QueryRenderer
        variables={{
          'owner': 'default',
          'name': this.props.labbookName,
          'first': Math.floor(Math.random() * 10000)
          }
        }
        environment={environment}
        query={containerStatusQuery}
        render={({error, props}) => {

          if(error){
            console.error(error)
            return <div>{error.message}</div>
          }else if(props){

            let status = this._getContainerStatusText(props.labbook.environment.containerStatus, props.labbook.environment.imageStatus)
            return(
              <div className="ContainerStatus flex flex--column">
                <div onClick={(evt) => this._openCloseContainer(evt, status)} className={'ContainerStatus__container-state ' + ((this.props.isBuilding) ? 'Building' : status)}>
                  {this.props.isBuilding ? 'Building' : status}
                </div>
              </div>)
          } else{
            let status = this._getContainerStatusText(this.state.containerStatus, this.state.imageStatus)

            return (
              <div className="ContainerStatus flex flex--column" onClick={(evt) => this._openCloseContainer(evt, status)} key="tempStatus" >
                <div className={'ContainerStatus__container-state ' + ((this.props.isBuilding) ? 'Building' : status)}>
                  {((this.props.isBuilding) ? 'Building' : status)}
                </div>
            </div>)
          }
        }
      }

      />
    )
  }
}
