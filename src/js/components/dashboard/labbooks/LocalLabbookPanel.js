//vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react'
//mutations
import ExportLabbookMutation from 'Mutations/ExportLabbookMutation'
//utilities
import JobStatus from 'JS/utils/JobStatus'
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

      store.dispatch({
        type: 'UPLOAD_MESSAGE',
        payload: {
          uploadMessage: 'Exporting LabBook',
          open: true,
          success: false,
          error: false
        }
      })

      ExportLabbookMutation(username, edge.node.name, (response, error)=>{

        if(response.exportLabbook){
          JobStatus.getJobStatus(response.exportLabbook.jobKey).then((data)=>{


              if(data.jobStatus.result){
                store.dispatch({
                  type: 'UPLOAD_MESSAGE',
                  payload: {
                    uploadMessage: `Export file ${data.jobStatus.result} is available in the export directory of your Gigantum working directory.`,
                    open: true,
                    success: false,
                    error: false
                  }
                })
              }

              exportClassList.remove('LocalLabbooks__export--downloading')
          }).catch((error)=>{

              if(error){
                store.dispatch({
                  type: 'UPLOAD_MESSAGE',
                  payload: {
                    uploadMessage: `Export failed`,
                    open: true,
                    success: false,
                    error: true
                  }
                })
              }
              exportClassList.remove('LocalLabbooks__export--downloading')
          })
      }else{

        store.dispatch({
          type: 'UPLOAD_MESSAGE',
          payload: {
            uploadMessage: 'Export Failed: ' + error[0].message,
            open: true,
            success: false,
            error: true
          }
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

          <div className="LocalLabbooks__containerStatus">
            <div className={'LocalLabbooks__containerStatus--state ' + status}>
              {status}
            </div>
          </div>
        </div>

        <div className="LocalLabbooks__text-row">
          <div className="LocalLabbooks__title-row">
            <h4
              className="LocalLabbooks__panel-title"
              onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner.username)}>
              {edge.node.name}
            </h4>
            <div className="LocalLabbooks__edit-button" onClick={() => this.props.renameLabbookModal(edge.node.name)}>
            </div>
          </div>
          <p className="LocalLabbooks__owner">{'Created by ' + edge.node.owner.username}</p>
          <p
            onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner.username)} className="LocalLabbooks__description">
            {edge.node.description}
          </p>
        </div>

        <div className="LocalLabbooks__info-row flex flex--row justify--space-between">
          <div className="LocalLabbooks__owner flex flex--row">
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
