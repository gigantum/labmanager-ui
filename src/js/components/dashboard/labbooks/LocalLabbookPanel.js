//vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react'
//mutations
import ExportLabbookMutation from 'Mutations/ExportLabbookMutation'
//utilities
import JobStatus from 'JS/utils/JobStatus'
/**
*  labbook panel is to only render the edge passed to it
*/

export default class LocalLabbookPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'exportPath': '',
      'show': false,
      'message': '',
      'title': 'Export Successful',
      'type': 'success'
    }

    this._exportLabbook = this._exportLabbook.bind(this)
  }

  _getContainerStatusText(containerStatus, imageStatus){

    let status = (containerStatus === 'RUNNING') ? 'Open' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Closed' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;

    return status;
  }
  /**
  * @param {event, object} evt,edge
  *  runs export mutation if export has not been downloaded
  *
  */
  _exportLabbook = (evt, edge) => {

    if(this.state.exportPath.length === 0){

      let exportClassList = document.getElementById(evt.target.id).classList;

      exportClassList.add('LocalLabbooks__export--downloading')
      let username = localStorage.getItem('username')
      ExportLabbookMutation(username, username, edge.node.name, (response, error)=>{
        if(response.exportLabbook){
          JobStatus.getJobStatus(response.exportLabbook.jobKey).then((data)=>{

              this.setState({
                'exportPath': data.jobStatus.result ? data.jobStatus.result : '',
                'show': true,
                'message': `Export file ${data.jobStatus.result} is available in the export directory of your Gigantum working directory.`,
                'type': 'success',
                'title': 'Export Successful'
              })

              exportClassList.remove('LocalLabbooks__export--downloading')
          }).catch((error)=>{
              exportClassList.remove('LocalLabbooks__export--downloading')
          })
      }else{

        this.setState({

          'message': error[0].message,
          'show': true,
          'type': 'error',
          'title': 'Export Failed'
        })
        exportClassList.remove('LocalLabbooks__export--downloading')
      }
    })
  }

  }
  render(){
    let edge = this.props.edge;
    let status = this._getContainerStatusText(edge.node.environment.containerStatus, edge.node.environment.imageStatus)
    let exportFile = this.state.exportPath.split('/')[this.state.exportPath.split('/').length - 1]

    return (
      <div
        key={edge.node.name}
        className='LocalLabbooks__panel flex flex--column justify--space-between'>

        <div className="LocalLabbooks__icon-row">
          <div onClick={() => this.props.goToLabbook(edge.node.name)} className="LocalLabbooks__labbook-icon"></div>
          <div className="LocalLabbooks__containerStatus flex flex--column">
            <div className={'LocalLabbooks__containerStatus--state ' + status}>
              {status}
            </div>
          </div>
        </div>

        <div className="LocalLabbooks__text-row">
          <h4
            className="LocalLabbooks__panel-title"
            onClick={() => this.props.goToLabbook(edge.node.name)}>
            {edge.node.name}
          </h4>
          <p
            onClick={() => this.props.goToLabbook(edge.node.name)} className="LocalLabbooks__description">
            {edge.node.description}
          </p>
        </div>

        <div className="LocalLabbooks__info-row flex flex--row justify--space-between">
          <div className="LocalLabbooks__owner flex flex--row">
              <div>Owner</div>
              <div className="LocalLabbooks__owner-icon"></div>
              {/* <div> {owner.username}</div> */}

          </div>
          <div className="LocalLabbooks__status">
            <div
              id={'Export__localLabbooks' + edge.node.name}
              ref={'Export__localLabbooks' + edge.node.name}
              onMouseDown={(evt) => this._exportLabbook(evt, edge)} className="LocalLabbooks__export">
              Export
            </div>
            <SweetAlert
              className="sa-error-container"
              show={this.state.show}
              type={this.state.type}
              title={this.state.title}
              text={ this.state.message }
              onConfirm={() => {
                this.setState({ show: false})
              }}
              />

          </div>

        </div>


    </div>)
  }
}
