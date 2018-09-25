// vendor
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import uuidv4 from 'uuid/v4';
// utilities
import JobStatus from 'JS/utils/JobStatus';
import ChunkUploader from 'JS/utils/ChunkUploader';
// components
import LoginPrompt from 'Components/labbook/labbookHeader/branchMenu/modals/LoginPrompt';
import ToolTip from 'Components/shared/ToolTip';
// store
import store from 'JS/redux/store';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// mutations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation';
import BuildImageMutation from 'Mutations/BuildImageMutation';
// assets
import './ImportModule.scss';
/**
  @param {number} bytes
  converts bytes into suitable units
*/
const _humanFileSize = (bytes) => {
  const thresh = 1000;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} kB`;
  }

  const units = [
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB',
  ];

  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);

  return `${bytes.toFixed(1)} ${units[u]}`;
};
/*
 @param {object} workerData
 uses redux to dispatch file upload to the footer
*/
const dispatchLoadingProgress = (wokerData) => {
  let bytesUploaded = (wokerData.chunkSize * (wokerData.chunkIndex + 1)) / 1000;
  const totalBytes = wokerData.fileSizeKb;
  bytesUploaded = bytesUploaded < totalBytes
    ? bytesUploaded
    : totalBytes;
  const totalBytesString = _humanFileSize(totalBytes);
  const bytesUploadedString = _humanFileSize(bytesUploaded);

  store.dispatch({
    type: 'UPLOAD_MESSAGE_UPDATE',
    payload: {
      id: '',
      uploadMessage: `${bytesUploadedString} of ${totalBytesString} uploaded`,
      totalBytes,
      percentage: (Math.floor((bytesUploaded / totalBytes) * 100) <= 100)
        ? Math.floor((bytesUploaded / totalBytes) * 100)
        : 100,
    },
  });

  if (document.getElementById('footerProgressBar')) {
    document.getElementById('footerProgressBar').style.width = `${Math.floor((bytesUploaded / totalBytes) * 100)}%`;
  }
};

/*
 @param {}
 uses redux to dispatch file upload failed status to the footer
*/
const dispatchFailedStatus = () => {
  store.dispatch({
    type: 'UPLOAD_MESSAGE_UPDATE',
    payload: {
      uploadMessage: 'Import failed',
      id: '',
      percentage: 0,
      uploadError: true,
    },
  });
};

/*
 @param {string} filePath
  gets new labbook name and url route
 @return
*/
const getRoute = (filepath) => {
  const filename = filepath.split('/')[filepath.split('/').length - 1];
  return filename.split('_')[0];
};
/*
 @param {string} filePath
 dispatched upload success message and passes labbookName/route to the footer
*/
const dispatchFinishedStatus = (filepath) => {
  const route = getRoute(filepath);

  store.dispatch({
    type: 'IMPORT_MESSAGE_SUCCESS',
    payload: {
      uploadMessage: `${route} Project is Ready`,
      id: '',
      labbookName: `${localStorage.getItem('username')}/${route}`, // route is labbookName
    },
  });
};

const dropZoneId = uuidv4();

let counter = 0;

export default class ImportModule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      message: '',
      files: [],
      type: 'info',
      error: false,
      isImporting: false,
      stopPropagation: false,
      importingScreen: false,
      importTransition: null,
      remoteURL: '',
    };

    this._getBlob = this._getBlob.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
    this._dragendHandler = this._dragendHandler.bind(this);
    this._fileSelected = this._fileSelected.bind(this);
    this._fileUpload = this._fileUpload.bind(this);
    this._importingState = this._importingState.bind(this);
    this._clearState = this._clearState.bind(this);
    this._toggleImportScreen = this._toggleImportScreen.bind(this);
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this);
    this._drop = this._drop.bind(this);
    this._dragover = this._dragover.bind(this);
    this._dragleave = this._dragleave.bind(this);
    this._dragenter = this._dragenter.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener('drop', this._drop);
    window.removeEventListener('dragover', this._dragover);
    window.removeEventListener('dragleave', this._dragleave);
    window.removeEventListener('dragenter', this._dragenter);
  }

  componentDidMount() {
    const fileInput = document.getElementById('file__input');
    if (fileInput) {
      fileInput.onclick = (evt) => {
        evt.cancelBubble = true;
        evt.stopPropagation(evt);
      };
    }

    window.addEventListener('drop', this._drop);
    window.addEventListener('dragover', this._dragover);
    window.addEventListener('dragleave', this._dragleave);
    window.addEventListener('dragenter', this._dragenter);
  }
  /**
  *  @param {object}
  *  detects when a file has been dropped
  */
  _drop(evt) {
    if (document.getElementById('dropZone')) {
      this._toggleImportScreen(false);
      document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight');
    }

    if (evt.target.classList.contains(dropZoneId)) {
      evt.preventDefault();
      evt.dataTransfer.effectAllowed = 'none';
      evt.dataTransfer.dropEffect = 'none';
    }
  }

  /**
  *  @param {object}
  *  detects when file has been dragged over the DOM
  */
  _dragover(evt) {
    if (document.getElementById('dropZone')) {
      this._toggleImportScreen(true);

      document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight');
    }

    if (evt.target.classList.contains(dropZoneId) < 0) {
      evt.preventDefault();
      evt.dataTransfer.effectAllowed = 'none';
      evt.dataTransfer.dropEffect = 'none';
    }
  }
  /**
  *  @param {object}
  *  detects when file leaves dropzone
  */
  _dragleave(evt) {
    counter--;

    if (evt.target.classList.contains(dropZoneId) < 0) {
      if (document.getElementById('dropZone')) {
        if (counter === 0) {
          this._toggleImportScreen(false);

          document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight');
        }
      }
    }
  }

  /**
  *  @param {object}
  *  detects when file enters dropzone
  */
  _dragenter(evt) {
    counter++;

    if (document.getElementById('dropZone')) {
      this._toggleImportScreen(true);

      document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight');
    }

    if (evt.target.classList.contains(dropZoneId) < 0) {
      evt.preventDefault();
      evt.dataTransfer.effectAllowed = 'none';
      evt.dataTransfer.dropEffect = 'none';
    }
  }

  /**
  *  @param {object} dataTransfer
  *  preventDefault on dragOver event
  */
  _getBlob = (dataTransfer) => {
    const self = this;
    for (let i = 0; i < dataTransfer.files.length; i++) {
      // let file = dataTransfer.items ? dataTransfer.items[i].getAsFile() : dataTransfer.files[0];
      const file = dataTransfer.files[0];
      if (file.name.slice(file.name.length - 4, file.name.length) !== '.lbk' && file.name.slice(file.name.length - 4, file.name.length) !== '.zip') {
        this.setState({ error: true });

        setTimeout(() => {
          self.setState({ error: false });
        }, 5000);
      } else {
        this.setState({ error: false });

        const fileReader = new FileReader();

        fileReader.onloadend = function (evt) {
          // debugger
          const arrayBuffer = evt.target.result;

          const blob = new Blob([new Uint8Array(arrayBuffer)]);

          self.setState({
            files: [
              {
                blob,
                file,
                arrayBuffer,
                filename: file.name,
              },
            ],
          });
          self._fileUpload();
        };

        fileReader.readAsArrayBuffer(file);
      }
    }
  }

  /**
  *  @param {Object} event
  *  preventDefault on dragOver event
  */
  _dragoverHandler = (evt) => { // use evt, event is a reserved word in chrome
    evt.preventDefault(); // this kicks the event up the event loop
  }

  /**
  *  @param {Object} event
  *  handle file drop and get file data
  */
  _dropHandler = (evt) => {
    // use evt, event is a reserved word in chrome
    const dataTransfer = evt.dataTransfer;
    evt.preventDefault();
    evt.dataTransfer.effectAllowed = 'none';
    evt.dataTransfer.dropEffect = 'none';

    // If dropped items aren't files, reject them;
    if (dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      this._getBlob(dataTransfer);
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < dataTransfer.files.length; i++) {
        this.setState({
          files: [dataTransfer.files[i].name],
        });
        this._fileUpload();
      }
    }

    return false;
  }

  /**
  *  @param {Object}
  *  handle end of dragover with file
  */
  _dragendHandler = (evt) => { // use evt, event is a reserved word in chrome
    const dataTransfer = evt.dataTransfer;

    evt.preventDefault();
    evt.dataTransfer.effectAllowed = 'none';
    evt.dataTransfer.dropEffect = 'none';

    if (dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      for (let i = 0; i < dataTransfer.items.length; i++) {
        dataTransfer.items.remove(i);
      }
    } else {
      // Use DataTransfer interface to remove the drag data
      evt.dataTransfer.clearData();
    }
    return false;
  }
  /**
  *  @param {Object}
  *  opens file system for user to select file
  */
  _fileSelected = (evt) => {
    this._getBlob(document.getElementById('file__input'));
    this.setState({ stopPropagation: false });
  }
  /**
  *  @param {Object}
  *   trigger file upload
  */
  _fileUpload = () => { // this code is going to be moved to the footer to complete the progress bar
    const self = this;

    this._importingState();

    const filepath = this.state.files[0].filename;

    const data = {
      file: this.state.files[0].file,
      filepath,
      username: localStorage.getItem('username'),
      accessToken: localStorage.getItem('access_token'),
    };

    // dispatch loading progress
    store.dispatch({
      type: 'UPLOAD_MESSAGE_SETTER',
      payload: {
        uploadMessage: 'Prepparing Import ...',
        totalBytes: this.state.files[0].file.size / 1000,
        percentage: 0,
        id: '',
      },
    });

    const postMessage = (wokerData) => {
      if (wokerData.importLabbook) {
        store.dispatch({
          type: 'UPLOAD_MESSAGE_UPDATE',
          payload: {
            uploadMessage: 'Upload Complete',
            percentage: 100,
            id: '',
          },
        });

        const importLabbook = wokerData.importLabbook;
        JobStatus.getJobStatus(importLabbook.importJobKey).then((response) => {
          store.dispatch({
            type: 'UPLOAD_MESSAGE_UPDATE',
            payload: {
              uploadMessage: 'Unzipping Project',
              percentage: 100,
              id: '',
            },
          });

          if (response.jobStatus.status === 'finished') {
            dispatchFinishedStatus(filepath);

            self._clearState();
          } else if (response.jobStatus.status === 'failed') {
            dispatchFailedStatus();

            self._clearState();
          }
        }).catch((error) => {
          console.log(error);

          store.dispatch({
            type: 'UPLOAD_MESSAGE_UPDATE',
            payload: {
              uploadMessage: 'Import failed',
              uploadError: true,
              id: '',
              percentage: 0,
            },
          });
          self._clearState();
        });
      } else if (wokerData.chunkSize) {
        dispatchLoadingProgress(wokerData);
      } else {
        store.dispatch({
          type: 'UPLOAD_MESSAGE_UPDATE',
          payload: {
            uploadMessage: wokerData[0].message,
            uploadError: true,
            id: '',
            percentage: 0,
          },
        });
        self._clearState();
      }
    };

    ChunkUploader.chunkFile(data, postMessage);
  }
  /**
    @param {object} error
    shows error message
  * */
  _showError(message) {
    store.dispatch({
      type: 'UPLOAD_MESSAGE_UPDATE',
      payload: {
        uploadMessage: message,
        uploadError: true,
        id: '',
        percentage: 0,
      },
    });
  }

  /**
  *  @param {}
  *  sets state of app for importing
  *  @return {}
  */
  _importingState = () => {
    this.setState({ isImporting: true });
  }

  /**
  *  @param {}
  *  clears state of file and sets css back to import
  *  @return {}
  */
  _clearState = () => {
    if (document.getElementById('dropZone__filename')) {
      document.getElementById('dropZone__filename').classList.remove('ImportModule__animation');
    }

    this.setState({ files: [], isImporting: false });
  }

  /**
  *  @param {}
  *  @return {string} returns text to be rendered
  */
  _getImportDescriptionText() {
    return this.state.error
      ? 'File must be .zip'
      : 'Drag & Drop .zip file, or click to select.';
  }
  /**
  *  @param {}
  *  shows create project modal
  *  @return {}
  */
  _showModal(evt) {
    if (navigator.onLine) {
      if (evt.target.id !== 'file__input-label') {
        this.props.showModal();
      }
    } else {
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload: {
          message: 'Cannot create a Project at this time.',
          messageBody: [
            {
              message: 'An internet connection is required to create a Project.',
            },
          ],
        },
      });
    }
  }

  /**
  *  @param {}
  *  shows import screen
  *  uses transition delay
  *  @return {}
  */
  _toggleImportScreen(value) {
    this.setState({ importTransition: value });

    setTimeout(() => {
      this.setState({ importingScreen: value });
    }, 250);
  }

  /**
  *  @param {Object} evt
  *  updated url in state
  *  @return {}
  */
  _updateRemoteUrl(evt) {
    this.setState({ remoteURL: evt.target.value });
  }

  /**
  *  @param {Object} evt
  *  imports labbook from remote url, builds the image, and redirects to imported labbook
  *  @return {}
  */
  importLabbook = (evt) => {
    const id = uuidv4(),
      labbookName = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 1],
      owner = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 2],
      remote = `https://repo.gigantum.io/${owner}/${labbookName}.git`;

    const self = this;

    UserIdentity.getUserIdentity().then((response) => {
      if (navigator.onLine) {
        if (response.data) {
          if (response.data.userIdentity.isSessionValid) {
            self._importingState();

            store.dispatch({
              type: 'MULTIPART_INFO_MESSAGE',
              payload: {
                id,
                message: 'Importing Project please wait',
                isLast: false,
                error: false,
              },
            });

            self._importRemoteProject(owner, labbookName, remote, id);
          } else {
            this.props.auth.renewToken(true, () => {
              this.setState({ showLoginPrompt: true });
            }, () => {
              this.importLabbook();
            });
          }
        }
      } else {
        this.setState({ showLoginPrompt: true });
      }
    });
  }
  /**
  *  @param {}
  *  @return {} hides login prompt modal
  */
  _closeLoginPromptModal() {
    this.setState({ showLoginPrompt: false });
  }
  /**
  *  @param {String, String, String, String}
  *  trigers ImportRemoteLabbookMutation
  *  @return {}
  */
  _importRemoteProject(owner, labbookName, remote, id) {
    const self = this;

    ImportRemoteLabbookMutation(owner, labbookName, remote, (response, error) => {
      this._clearState();

      if (error) {
        console.error(error);
        store.dispatch({
          type: 'MULTIPART_INFO_MESSAGE',
          payload: {
            id,
            message: 'ERROR: Could not import remote Project',
            messageBody: error,
            error: true,
          },
        });
      } else if (response) {
        store.dispatch({
          type: 'MULTIPART_INFO_MESSAGE',
          payload: {
            id,
            message: `Successfully imported remote Project ${labbookName}`,
            isLast: true,
            error: false,
          },
        });

        const { owner } = response.importRemoteLabbook.newLabbookEdge.node;

        self._buildImage(labbookName, owner, id);

        self.props.history.replace(`/projects/${owner}/${labbookName}`);
      } else {
        const owner = localStorage.getItem('username');
        self._buildImage(labbookName, owner, id);
      }
    });
  }

  /**
  *  @param {String, String, String}
  *  trigers BuildImageMutation
  *  @return {}
  */
  _buildImage(labbookName, owner, id) {
    BuildImageMutation(labbookName, owner, false, (error) => {
      if (error) {
        console.error(error);

        store.dispatch({
          type: 'MULTIPART_INFO_MESSAGE',
          payload: {
            id,
            message: `ERROR: Failed to build ${labbookName}`,
            messsagesList: error,
            error: true,
          },
        });
      }
    });
  }

  render() {
    const loadingMaskCSS = classNames({
      'ImportModule__loading-mask': this.state.isImporting,
      hidden: !this.state.isImporting,
    });

    return (<Fragment>

      <div id="dropZone" className="ImportModule Card Card--add Card--import column-4-span-3" key="addLabbook" ref={div => this.dropZone = div} type="file" onDragEnd={evt => this._dragendHandler(evt)} onDrop={evt => this._dropHandler(evt)} onDragOver={evt => this._dragoverHandler(evt)}>

        {
          !this.state.importingScreen
            ? <ImportMain self={this} />
            : <ImportDropZone self={this} />

        }

        <div className={loadingMaskCSS} />

      </div>

      {this.state.showLoginPrompt && <LoginPrompt closeModal={this._closeLoginPromptModal} />}

    </Fragment>);
  }
}

const ImportMain = ({ self }) => {
  const importCSS = classNames({
    'btn--import': true,
    'btn--expand': self.state.importTransition,
    'btn--collapse': !self.state.importTransition && self.state.importTransition !== null,
  });

  return (<div className="Import__labbook-main">

    <div className="Import__labbook-header">

      <div className="Import__labbook-icon">
        <div className="Import__add-icon" />
      </div>

      <div className="Import__title">
        <h4>Add Project</h4>
      </div>

    </div>

    <div
      className="btn--import"
      onClick={(evt) => {
        self._showModal(evt);
      }}
    >
      Create New
    </div>

    <ToolTip section="createLabbook" />

    <div
      className={importCSS}
      onClick={() => {
        self._toggleImportScreen(true);
      }}
    >
      Import Existing
    </div>

    <ToolTip section="importLabbook" />

  </div>);
};

const ImportDropZone = ({ self }) => (<div id="dropZone" className={`Import__section--import ${dropZoneId}`}>

  <div className={`btn--close ${dropZoneId}`} onClick={() => self._toggleImportScreen(false)} />

  <div className={`Import__dropzone  ${dropZoneId}`}>

    <h4 className={`Import__h4 Import__h4--margin ${dropZoneId}`}>
      Import Existing
    </h4>

    <p className={`Import_paragraph ${dropZoneId}`}>
      to import, do one of the following
    </p>

  </div>

  <p className={`${dropZoneId}`}>
    Drag .zip File Here
  </p>

  <label className={`Import__label--file-system ${dropZoneId}`} htmlFor="file__input">
    Browse & Upload .zip File
  </label>

  <input
    id="file__input"
    className="hidden"
    type="file"
    onChange={(evt) => {
      self._fileSelected(evt.files);
    }}
  />

  <div className={`Import__section--paste ${dropZoneId}`}>

    <input id="dropZone__filename" className={`Import__input--paste ${dropZoneId}`} type="text" placeholder="Paste Project URL" onChange={evt => self._updateRemoteUrl(evt)} />

    <button className={`Import__btn--go ${dropZoneId}`} onClick={() => self.importLabbook()} disabled={!self.state.remoteURL.length && !self.state.isImporting}>
      Go
    </button>

  </div>

                                      </div>);
