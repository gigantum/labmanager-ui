import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from './../../createRelayEnvironment'

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
      'building': this.props.isBuilding,
      'secondsElapsed': 0
    }

    containerStatus = this;
  }

  tick(){
    containerStatus.setState({secondsElapsed: containerStatus.state.secondsElapsed + 1});
  }

  componentDidMount(){
    this.interval = setInterval(this.tick, 2000);
  }


  _getContainerStatusText(value){
    let status = (value === 'RUNNING') ? 'Open' : value;
    status = (value === 'NOT_RUNNING') ? 'Closed' : status;
    status = (this.props.isBuilding) ? 'Building' : status;
    tempStatus = status

    return status;
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
            return <div>error.message</div>
          }else if(props){
            let status = this._getContainerStatusText(props.labbook.environment.containerStatus)

            return(
              <div className="ContainerStatus flex flex--column">
                <div className={'ContainerStatus__container-state ' + ((this.props.isBuilding) ? 'Building' : status)}>
                  {status}
                </div>
              </div>)
          } else{

            return (
              <div className="ContainerStatus flex flex--column">
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
