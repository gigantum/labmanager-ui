// vendor
import React, { Component, Fragment } from 'react';
import uuidv4 from 'uuid/v4';
// mutations
import SyncLabbookMutation from 'Mutations/branches/SyncLabbookMutation';
// component
import Modal from 'Components/shared/Modal';
// store
import store from 'JS/redux/store';
import { setMultiInfoMessage } from 'JS/redux/reducers/footer';
// assets
import './ForceSync.scss';

export default class ForceSync extends Component {
  _forceSync() {
    const id = uuidv4;
    const { owner, labbookName } = store.getState().routes;
    setMultiInfoMessage(id, 'Syncing Project with Gigantum cloud ...', false, false);

    SyncLabbookMutation(
      owner,
      labbookName,
      true,
      (error) => {
        if (error) {
          setMultiInfoMessage(id, `Could not 'force' sync ${labbookName}`, true, true, error);
        } else {
          setMultiInfoMessage(id, `Successfully 'force' synced ${labbookName}`, true, false);
        }
      },
    );
    this.props.toggleSyncModal();
  }
  render() {
    return (
      <Modal
        header="Force Sync"
        handleClose={() => this.props.toggleSyncModal()}
        size="medium"
        renderContent={() =>
          (<Fragment>
            <div>
              <p>Your Project conflicts with changes already synced to the server. You can “force” sync to pull the latest changes from the server.</p>
              <p><b>**Note: This will overwrite any conflicting files with the copy from the server.</b></p>
              <p>Do you want "force" sync anyway?</p>
            </div>
            <div className="ForceSync__buttonContainer">
              <button onClick={() => { this._forceSync(); }}>Yes</button>
              <button onClick={() => { this.props.toggleSyncModal(); }}>No</button>
            </div>
           </Fragment>)
        }
      />
    );
  }
}
