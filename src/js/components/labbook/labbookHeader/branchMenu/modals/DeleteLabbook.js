// vendor
import React, { Component } from 'react';
// Mutations
import DeleteLabbookMutation from 'Mutations/DeleteLabbookMutation';
import DeleteRemoteLabbookMutation from 'Mutations/DeleteRemoteLabbookMutation';
// components
import ButtonLoader from 'Components/shared/ButtonLoader';
import Modal from 'Components/shared/Modal';
// store
import { setErrorMessage, setWarningMessage, setInfoMessage } from 'JS/redux/reducers/footer';
import store from 'JS/redux/store';
// assets
import './DeleteLabbook.scss';

export default class DeleteLabbook extends Component {
  constructor(props) {
  	super(props);
  	this.state = {
      labbookName: '',
      deletePending: false,
      deleteLabbookButtonState: '',
    };
    this._deleteLabbook = this._deleteLabbook.bind(this);
  }
  /**
    @param {object} evt
    sets state of labbookName
  */
  _setLabbookName(evt) {
    this.setState({ labbookName: evt.target.value });
  }
  /**
    @param {}
    fires appropriate delete labbook mutation
  */
  _deleteLabbook() {
    const { labbookName, owner } = this.props.remoteDelete ? { labbookName: this.props.remoteLabbookName, owner: this.props.remoteOwner } : store.getState().routes;

    if (labbookName === this.state.labbookName) {
      this.setState({ deletePending: true, deleteLabbookButtonState: 'loading' });

      if (this.props.remoteDelete) {
        DeleteRemoteLabbookMutation(
          this.props.remoteLabbookName,
          this.props.remoteOwner,
          true,
          this.props.remoteId,
          this.props.labbookListId,
          this.props.remoteConnection,
          (response, error) => {
            this.setState({ deletePending: false });

            if (error) {
              setErrorMessage(`The was a problem deleting ${labbookName}`, error);
              this.setState({ deleteLabbookButtonState: 'error' });
              setTimeout(() => {
                this.setState({ labbookName: '', deletePending: false, deleteLabbookButtonState: '' });
                this.props.toggleModal();

                if (document.getElementById('deleteInput')) {
                  document.getElementById('deleteInput').value = '';
                }
              }, 1000);
            } else {
              setInfoMessage(`${labbookName} has been remotely deleted`);
              this.setState({ deleteLabbookButtonState: 'finished' });
              setTimeout(() => {
                this.setState({ labbookName: '', deletePending: false, deleteLabbookButtonState: '' });
                this.props.toggleModal();

                if (document.getElementById('deleteInput')) {
                  document.getElementById('deleteInput').value = '';
                }
              }, 1000);
            }
          },
        );
      } else {
        DeleteLabbookMutation(
          labbookName,
          owner,
          true,
          (response, error) => {
            this.setState({ deletePending: false });

            if (error) {
              setErrorMessage(`The was a problem deleting ${labbookName}`, error);
              this.setState({ deleteLabbookButtonState: 'error' });
              setTimeout(() => {
                this.setState({ deleteLabbookButtonState: '' });
              }, 2000);
            } else {
              setInfoMessage(`${labbookName} has been deleted`);
              this.setState({ deleteLabbookButtonState: 'finished' });
              setTimeout(() => {
                this.props.history.replace('../../projects/');
              }, 2000);
            }
          },
        );
      }
    } else {
      setWarningMessage('Names do not match');
    }
  }

  /**
    *  @param {}
    *  determines the warning text to be displayed to the user
  */
  _getExplanationText() {
    const { labbookName, owner } = store.getState().routes;
    if (this.props.remoteDelete) {
      if (this.props.existsLocally) {
        return (
          <div>
            <p>This will delete <b>{this.props.remoteLabbookName}</b> from the cloud.</p>
            <p>The Project will still exist locally.</p>
          </div>
        );
      }
      return (
        <p>This will delete <b>{this.props.remoteLabbookName}</b> from the cloud. All data will be removed and can not be recovered.</p>
      );
    } else if (this.props.remoteAdded) {
      return (
        <div>
          <p>This will delete <b>{labbookName}</b> from this Gigantum client.</p>
          <p>You can still download it from gigantum.com/{owner}/{labbookName}.</p>
        </div>);
    }
    return (<p>This will delete <b>{labbookName}</b> from this Gigantum instance. All data will be removed and can not be recovered.</p>);
  }

  render() {
    const deleteText = this.props.remoteDelete ? 'Delete Remote Project' : 'Delete Project';
    const { labbookName } = this.props.remoteDelete ? { labbookName: this.props.remoteLabbookName } : store.getState().routes;
    return (
      <Modal
        header={deleteText}
        handleClose={() => this.props.handleClose()}
        size="medium"
        renderContent={() =>
          (<div className="DeleteLabbook">
            {this._getExplanationText()}
            <input
              id="deleteInput"
              placeholder={`Enter ${labbookName} to delete`}
              onKeyUp={(evt) => { this._setLabbookName(evt); }}
              onChange={(evt) => { this._setLabbookName(evt); }}
              type="text"
            />


            <ButtonLoader
              buttonState={this.state.deleteLabbookButtonState}
              buttonText={deleteText}
              className=""
              params={{}}
              buttonDisabled={this.state.deletePending || labbookName !== this.state.labbookName}
              clicked={this._deleteLabbook}
            />
           </div>)
        }
      />
    );
  }
}
