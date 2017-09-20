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
      'status': this.props.containerStatus,
      'building': this.props.isBuilding ? true : false,
      'secondsElapsed': 0
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

  componentWillUnmount() {
    //memory clean up
    clearInterval(this.interval);
  }


  _getContainerStatusText(value){
    let status = (value === 'RUNNING') ? 'Open' : value;
    status = (value === 'NOT_RUNNING') ? 'Closed' : status;
    status = (this.props.isBuilding) ? 'Building' : status;

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
              setTimeout(function(){
                window.open('http://localhost:8888/', '_blank')
              }, 3000)
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
            return <div>{error.message}</div>
          }else if(props){

            return(
              <div className="ContainerStatus flex flex--column">
                <div onClick={(evt) => this._openCloseContainer(evt, this._getContainerStatusText(props.labbook.environment.containerStatus))} className={'ContainerStatus__container-state ' + ((this.props.isBuilding) ? 'Building' : this._getContainerStatusText(props.labbook.environment.containerStatus))}>
                  {this._getContainerStatusText(props.labbook.environment.containerStatus)}
                </div>
              </div>)
          } else{

            return (
              <div key="tempStatus" className="ContainerStatus flex flex--column">
                <div className={'ContainerStatus__container-state ' + ((this.props.isBuilding) ? 'Building' : tempStatus)}>
                  {((this.props.isBuilding) ? 'Building' : tempStatus)}
                </div>
            </div>)
          }
        }
      }

      />
    )
  }
}
