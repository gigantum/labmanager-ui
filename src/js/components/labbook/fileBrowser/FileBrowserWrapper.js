// vendor
import React, { Component } from 'react';
import FileBrowser from 'Submodules/react-keyed-file-browser/FileBrowser/src/browser';
import uuidv4 from 'uuid/v4';
// components
import DetailPanel from './../detail/DetailPanel';
import Modal from 'Components/shared/Modal';
// mutations
import DeleteLabbookFileMutation from 'Mutations/fileBrowser/DeleteLabbookFileMutation';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation';
import MoveLabbookFileMutation from 'Mutations/fileBrowser/MoveLabbookFileMutation';
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation';
import RemoveFavoriteMutation from 'Mutations/fileBrowser/RemoveFavoriteMutation';
import CompleteBatchUploadTransactionMutation from 'Mutations/fileBrowser/CompleteBatchUploadTransactionMutation';
// helpers
import FolderUpload from './folderUpload';
// Config
import config from 'JS/config';

// utilities
import ChunkUploader from 'JS/utils/ChunkUploader';
// store
import {
  setErrorMessage,
  setWarningMessage,
  setInfoMessage,
  setUploadMessageSetter,
  setUploadMessageRemove,
} from 'JS/redux/reducers/footer';
import {
  setStartedUploading,
  setPauseUpload,
  setPauseUploadData,
  setResetChunkUpload,
} from 'JS/redux/reducers/labbook/fileBrowser/fileBrowserWrapper';
import { setUpdateDetailView } from 'JS/redux/reducers/labbook/labbook';
import store from 'JS/redux/store';


/**
* @param {array} files
*
* @return {number} totalFiles
*/
const getTotalFileLength = (files) => {
  let fileCount = 0;
  let hasDirectoryUpload = false;

  function filesRecursionCount(file) {
    if (Array.isArray(file)) {
      file.forEach((nestedFile) => {
        filesRecursionCount(nestedFile);
      });
    } else if (file.file && Array.isArray(file.file) && (file.file.length > 0)) {
      file.file.forEach((nestedFile) => {
        filesRecursionCount(nestedFile);
      });
    } else {
      const extension = file.name ? file.name.replace(/.*\./, '') : file.entry.fullPath.replace(/.*\./, '');

      if (file.entry && file.entry.isDirectory) {
        hasDirectoryUpload = true;
      }

      if ((config.fileBrowser.excludedFiles.indexOf(extension) < 0) && ((file.entry && file.entry.isFile) || (typeof file.type === 'string'))) {
        fileCount++;
      }
    }
  }

  filesRecursionCount(files);

  return { fileCount, hasDirectoryUpload };
};

export default class FileBrowserWrapper extends Component {
  constructor(props) {
    super(props);
    const { owner, labbookName } = store.getState().routes;
    const { uploading } = store.getState().fileBrowser;
    this.state = {
      show: false,
      selectedFile: null,
      message: '',
      files: this._formatFileJson(props.files),
      fileSizePromptVisible: false,
      uploadData: {},
      pause: false,
      labbookName,
      owner,
      uploading,
    };

    // bind functions here
    this.handleCreateFolder = this.handleCreateFolder.bind(this);
    this.handleCreateFiles = this.handleCreateFiles.bind(this);
    this.handleRenameFolder = this.handleRenameFolder.bind(this);
    this.handleRenameFile = this.handleRenameFile.bind(this);
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this);
    this.handleDeleteFile = this.handleDeleteFile.bind(this);
    this.openDetailPanel = this.openDetailPanel.bind(this);
    this.handleFileFavoriting = this.handleFileFavoriting.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.setState({
        uploading: store.getState().fileBrowser.uploading,
        pause: store.getState().fileBrowser.pause,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps.selectedFiles.length > 0) {
      this.handleCreateFiles(nextProps.selectedFiles, '');

      this.props.clearSelectedFiles();
    }
  }
  /**
  *  @param {string} key - file key
  *  creates a directory using MakeLabbookDirectoryMutation
  */
  handleCreateFolder(key) {
    const self = this;

    MakeLabbookDirectoryMutation(
      this.props.connection,
      self.state.owner,
      this.state.labbookName,
      this.props.parentId,
      key,
      this.props.section,
      (response, error) => {
        if (error) {
          console.error(error);
          setErrorMessage(`ERROR: could not create ${key}`, error);
        }
      },
    );
  }

  /**
  *  @param {string, file, object, boolean, array, number} key,prefix  file key, prefix is root folder -
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  _chunkLoader(data, callback, chunkIndex) {
    ChunkUploader.chunkFile(data, callback, chunkIndex);
  }

  /**
  *  @param {array, boolean}
  *  updates footer message depending on the type of upload
  */
  _creteFilesFooterMessage(totalFiles, hasDirectoryUpload, fileSizeData) {
    if (totalFiles > 0) {
      setStartedUploading();
      setUploadMessageSetter(`Preparing Upload for ${totalFiles} files`, Math.random() * 10000, totalFiles);
    } else if (hasDirectoryUpload && (totalFiles === 0)) {
      setStartedUploading();
      setInfoMessage('Uploading Directories');
    } else if (fileSizeData.fileSizeNotAllowed.length > 0) {
      const fileSizePromptNames = fileSizeData.fileSizePrompt.map(file => file.name);
      const fileSizeNotAllowedNames = fileSizeData.fileSizeNotAllowed
        .map(file => file.name)
        .filter(name => fileSizePromptNames.indexOf(name) < 0);

      const fileSizeNotAllowedString = fileSizeNotAllowedNames.join(', ');

      if (fileSizeNotAllowedString.length > 0) {
        const size = this.props.section === 'code' ? '100 MB' : '1.8 GB';
        const message = `Cannot upload files over ${size} to the ${this.props.section} directory. The following files have not been added ${fileSizeNotAllowedString}`;

        setWarningMessage(message);
      }
    } else {
      setWarningMessage('Cannot upload these file types');
    }
  }

  /**
  *  @param {array, string, Int}
  *  flattens file Array
  *  filters file Array
  *  kicks off upload function
  */
  _startFolderUpload(folderFiles, prefix, totalFiles) {
    const flattenedFiles = [];
    // recursively flattens the file array
    function flattenFiles(filesArray) {
      if (Array.isArray(filesArray)) {
        filesArray.forEach((filesSubArray) => {
          flattenFiles(filesSubArray);
        });
      } else if (Array.isArray(filesArray.file) && (filesArray.file.length > 0)) {
        flattenFiles(filesArray.file);
      } else if (filesArray.entry) {
        flattenedFiles.push(filesArray);
      }
    }

    flattenFiles(folderFiles);

    const filterFiles = flattenedFiles.filter((fileItem) => {
      const extension = fileItem.name ? fileItem.name.replace(/.*\./, '') : fileItem.entry.fullPath.replace(/.*\./, '');

      return (config.fileBrowser.excludedFiles.indexOf(extension) < 0);
    });
    const count = 0;

    FolderUpload.uploadFiles(
      filterFiles,
      prefix,
      this.state.labbookName,
      this.state.owner,
      this.props.section,
      this.props.connection,
      this.props.parentId,
      this._chunkLoader,
      totalFiles,
      count,
    );
  }

  /**
  *  @param {array, string}
  *  gets file count and upload type
  *  sets upload message
  *
  */
  _startFileUpload(files, prefix, fileSizeData) {
    let fileMetaData = getTotalFileLength(files),
      transactionId = uuidv4(),
      totalFiles = fileMetaData.fileCount - fileSizeData.fileSizeNotAllowed,
      hasDirectoryUpload = fileMetaData.hasDirectoryUpload,
      self = this,
      folderFiles = [];

    this._creteFilesFooterMessage(totalFiles, hasDirectoryUpload, fileSizeData);
    // loop through files and upload if file is a file
    files.forEach((file, index) => {
      if (file.isDirectory) {
        folderFiles.push(file);
      } else if (file.name) {
        const isFileAllowed = fileSizeData.fileSizeNotAllowed.filter(largeFile => largeFile.name === file.name).length === 0;

        if (isFileAllowed) {
          let newKey = prefix;

          if ((prefix !== '') && (prefix.substring(prefix.length - 1, prefix.length) !== '/')) {
            newKey += '/';
          }

          newKey += file.name;

          const fileReader = new FileReader();

          fileReader.onloadend = function (evt) {
            const filepath = newKey;

            const data = {
              file,
              filepath,
              username: self.state.owner,
              accessToken: localStorage.getItem('access_token'),
              connectionKey: self.props.connection,
              labbookName: self.state.labbookName,
              parentId: self.props.parentId,
              section: self.props.section,
              transactionId,
            };

            self._chunkLoader(data, (data) => {

            });
          };

          fileReader.readAsArrayBuffer(file);
        } else {
          // WARNING_MESSAGE
        }
      } else {
        folderFiles.push(file);
      }
    });

    if (folderFiles.length > 0) {
      self._startFolderUpload(folderFiles, prefix, totalFiles);
    }
  }

  /**
  * @param {array} files
  *
  * @return {number} totalFiles
  */
  _checkFileSize = (files, noPrompt) => {
    const tenMB = 10 * 1000 * 1000;
    const oneHundredMB = 100 * 1000 * 1000;
    const eighteenHundredMB = oneHundredMB * 18;
    const fileSizePrompt = [];
    const fileSizeNotAllowed = [];

    function filesRecursionCount(file) {
      if (Array.isArray(file)) {
        file.forEach((nestedFile) => {
          filesRecursionCount(nestedFile);
        });
      } else if (file.file && Array.isArray(file.file) && (file.file.length > 0)) {
        file.file.forEach((nestedFile) => {
          filesRecursionCount(nestedFile);
        });
      } else {
        const extension = file.name ? file.name.replace(/.*\./, '') : file.entry.fullPath.replace(/.*\./, '');

        if ((config.fileBrowser.excludedFiles.indexOf(extension) < 0) && ((file.entry && file.entry.isFile) || (typeof file.type === 'string'))) {
          if (!noPrompt) {
            if (file.size > oneHundredMB) {
              fileSizeNotAllowed.push(file);
            }

            if ((file.size > tenMB) && (file.size < oneHundredMB)) {
              fileSizePrompt.push(file);
            }
          } else if (file.size > eighteenHundredMB) {
            fileSizeNotAllowed.push(file);
          }
        }
      }
    }

    filesRecursionCount(files);

    return { fileSizeNotAllowed, fileSizePrompt };
  }
  /**
  *  @param {string, string} key,prefix  file key, prefix is root folder -
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  handleCreateFiles(files, prefix) {
    if (!this.state.uploading) {
      if (this.props.section === 'code') {
        const fileSizeData = this._checkFileSize(files);

        if (fileSizeData.fileSizePrompt.length === 0) {
          this._startFileUpload(files, prefix, fileSizeData);
        } else {
          this.setState({
            uploadData: {
              files,
              prefix,
              fileSizeData,
            },
          });

          this._promptUserToAcceptUpload();
        }
      } else {
        const fileSizeData = this._checkFileSize(files, true);
        this._startFileUpload(files, prefix, fileSizeData);
      }
    }
  }
  /**
  *  @param {}  -
  *  show modal assking user if they want to upload files between 10-100 MB
  */
  _promptUserToAcceptUpload() {
    this.setState({ fileSizePromptVisible: true });
  }
  /**
  *  @param {}
  *  user rejects upload
  *  prompt files are concatonated into not allowed files
  *  return {}
  */
  _userRejectsUpload() {
    const {
      files,
      prefix,
    } = this.state.uploadData;

    const fileSizeData = this.state.uploadData.fileSizeData;
    const fileSizeNotAllowed = fileSizeData.fileSizeNotAllowed.concat(fileSizeData.fileSizePrompt);

    fileSizeData.fileSizeNotAllowed = fileSizeNotAllowed;

    this._startFileUpload(files, prefix, fileSizeData);

    this.setState({ fileSizePromptVisible: false });
  }
  /**
  *  @param {}
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  _userAcceptsUpload() {
    const {
      files,
      prefix,
      fileSizeData,
    } = this.state.uploadData;

    this._startFileUpload(files, prefix, fileSizeData);

    this.setState({ fileSizePromptVisible: false });
  }
  /**
  *  @param {}
  *  user cancels upload
  */
  _cancelUpload() {
    this.setState({ fileSizePromptVisible: false });
  }
  /**
  *  @param {string, string} oldKey,newKey  file key, prefix is root folder -
  *  renames folder by creating new folder, moving files to the folder and deleting the old folder
  */
  handleRenameFolder(oldKey, newKey) {
    const self = this;
    const edgesToMove = this.props.files.edges.filter(edge => edge && (edge.node.key.indexOf(oldKey) > -1));

    MakeLabbookDirectoryMutation(
      this.props.connection,
      self.state.owner,
      this.state.labbookName,
      this.props.parentId,
      newKey,
      this.props.section,
      (response, error) => {
        if (error) {
          setErrorMessage(`ERROR: could not make ${newKey}`, error);
        }
        const all = [];

        edgesToMove.forEach((edge) => {
          if (edge.node.key.indexOf('.') > -1) {
            all.push(new Promise((resolve, reject) => {
              const newKeyComputed = edge.node.key.replace(oldKey, newKey);

              MoveLabbookFileMutation(
                this.props.connection,
                self.state.owner,
                this.state.labbookName,
                this.props.parentId,
                edge,
                edge.node.key,
                newKeyComputed,
                this.props.section,
                (moveResponse, error) => {
                  if (moveResponse.moveLabbookFile) {
                    if (edge.node.isFavorite) {
                      RemoveFavoriteMutation(
                        this.props.favoriteConnection,
                        this.props.parentId,
                        this.state.owner,
                        this.state.labbookName,
                        this.props.section,
                        edge.node.key,
                        edge.node.id,
                        edge,
                        this.props.favorites,
                        (response, error) => {
                          if (error) {
                            reject(moveResponse.moveLabbookFile);
                            console.error(error);
                            setErrorMessage(`ERROR: could not remove favorite ${oldKey}`, error);
                          } else {
                            AddFavoriteMutation(
                              this.props.favoriteConnection,
                              this.props.connection,
                              this.props.parentId,
                              this.state.owner,
                              this.state.labbookName,
                              newKeyComputed,
                              '',
                              false,
                              moveResponse.moveLabbookFile.newLabbookFileEdge,
                              this.props.section,
                              (response, error) => {
                                if (error) {
                                  reject(moveResponse.moveLabbookFile);

                                  console.error(error);
                                  setErrorMessage(`ERROR: could not add favorite ${newKey}`, error);
                                } else {
                                  resolve(moveResponse.moveLabbookFile);
                                }
                              },
                            );
                          }
                        },
                      );
                    }
                  } else {
                    setErrorMessage(`ERROR: could not move ${edge.node.key}`, error);
                    reject(moveResponse);
                  }
                },
              );
            }));
          }
        });

        Promise.all(all).then((values) => {
          const edgeToDelete = this.props.files.edges.filter(edge => edge && (oldKey === edge.node.key))[0];

          const edgesToDelete = this.props.files.edges.filter(edge => edge && (edge.node.key.indexOf(oldKey) > -1))[0];

          DeleteLabbookFileMutation(
            this.props.connection,
            self.state.owner,
            this.state.labbookName,
            this.props.parentId,
            edgeToDelete.node.id,
            oldKey,
            this.props.section,
            edgesToDelete,
            (response, error) => {
              if (error) {
                console.error(error);
                setErrorMessage(`ERROR: could node delete file ${oldKey}`, error);
              }
            },
          );
        }).catch((error) => {
          console.error(error);
        });
      },
    );
  }

  /**
  *  @param {string, string} oldKey,newKey
  *  moves file from old folder to a new folder
  */
  handleRenameFile(oldKey, newKey) {
    const edgeToMove = this.props.files.edges.filter(edge => edge && edge.node && (oldKey === edge.node.key))[0];

    // TODO fix this function, there are too many nested if else statements

    if (edgeToMove) {
      MoveLabbookFileMutation(
        this.props.connection,
        this.state.owner,
        this.state.labbookName,
        this.props.parentId,
        edgeToMove,
        oldKey,
        newKey,
        this.props.section,
        (moveResponse, error) => {
          if (error) {
            console.error(error);
            setErrorMessage(`ERROR: could not move file ${oldKey}`, error);
          } else if (edgeToMove.node.isFavorite) {
            RemoveFavoriteMutation(
              this.props.favoriteConnection,
              this.props.parentId,
              this.state.owner,
              this.state.labbookName,
              this.props.section,
              oldKey,
              edgeToMove.node.id,
              edgeToMove,
              this.props.favorites,
              (response, error) => {
                if (error) {
                  console.error(error);
                  setErrorMessage(`ERROR: could not remove favorite ${oldKey}`, error);
                } else {
                  if (newKey[0] === '/') {
                    newKey = newKey.slice(1);
                  }
                  AddFavoriteMutation(
                    this.props.favoriteConnection,
                    this.props.connection,
                    this.props.parentId,
                    this.state.owner,
                    this.state.labbookName,
                    newKey,
                    '',
                    false,
                    moveResponse.moveLabbookFile.newLabbookFileEdge,
                    this.props.section,
                    (response, error) => {
                      if (error) {
                        console.error(error);
                        setErrorMessage(`ERROR: could not add favorite ${newKey}`, error);
                      }
                    },
                  );
                }
              },
            );
          }
        },
      );
    }
  }

  /**
  *  @param {string} folderKey
  *  deletes foler with a specified key
  */
  handleDeleteFolder(folderKey) {
    const edgeToDelete = this.props.files.edges.filter(edge => edge && edge.node && (folderKey === edge.node.key))[0];

    const edgesToDelete = this.props.files.edges.filter(edge => edge && (edge.node.key.indexOf(folderKey) > -1));

    if (edgeToDelete) {
      DeleteLabbookFileMutation(
        this.props.connection,
        this.state.owner,
        this.state.labbookName,
        this.props.parentId,
        edgeToDelete.node.id,
        folderKey,
        this.props.section,
        edgesToDelete,
        (response, error) => {
          if (error) {
            console.error(error);
            setErrorMessage(`ERROR: could not delete folder ${folderKey}`, error);
          }
        },
      );
    }

    edgesToDelete.forEach((edge) => {
      if (edge.node.isFavorite) {
        RemoveFavoriteMutation(
          this.props.favoriteConnection,
          this.props.parentId,
          this.state.owner,
          this.state.labbookName,
          this.props.section,
          edge.node.key,
          edge.node.id,
          edge,
          this.props.favorites,
          (response, error) => {
            if (error) {
              console.error(error);
              setErrorMessage(`ERROR: could not remove favorite ${edgeToDelete.node.key}`, error);
            }
          },
        );
      }
    });
  }
  /**
  *  @param {string} fileKey
  *  deletes file with a specified key
  */
  handleDeleteFile(fileKey) {
    const edgeToDelete = this.props.files.edges.filter(edge => edge && edge.node && (fileKey === edge.node.key))[0];

    if (edgeToDelete.node.isFavorite) {
      RemoveFavoriteMutation(
        this.props.favoriteConnection,
        this.props.parentId,
        this.state.owner,
        this.state.labbookName,
        this.props.section,
        edgeToDelete.node.key,
        edgeToDelete.node.id,
        edgeToDelete,
        this.props.favorites,
        (response, error) => {
          if (error) {
            console.error(error);
            setErrorMessage(`ERROR: could not remove favorite ${edgeToDelete.node.key}`, error);
          } else {
            DeleteLabbookFileMutation(
              this.props.connection,
              this.state.owner,
              this.state.labbookName,
              this.props.parentId,
              edgeToDelete.node.id,
              fileKey,
              this.props.section,
              [],
              (response, error) => {
                if (error) {
                  console.error(error);
                  setErrorMessage(`ERROR: could not delete file ${fileKey}`, error);
                }
              },
            );
          }
        },
      );
    } else {
      DeleteLabbookFileMutation(
        this.props.connection,
        this.state.owner,
        this.state.labbookName,
        this.props.parentId,
        edgeToDelete.node.id,
        fileKey,
        this.props.section,
        [],
        (response, error) => {
          if (error) {
            console.error(error);
            setErrorMessage(`ERROR: could not delete file ${fileKey}`, error);
          }
        },
      );
    }
  }
  /**
  *  @param {object} files
  *  formats files for file browser
  *  @return {array}
  */
  _formatFileJson(files) {
    const formatedArray = [];
    const idExists = [];

    if (files) {
      files.edges.forEach((edge) => {
        if (edge && edge.node) {
          if (idExists.indexOf(edge.node.id) === -1) {
            formatedArray.push({
              key: edge.node.key,
              modified: edge.node.modifiedAt,
              size: edge.node.size,
              isFavorite: edge.node.isFavorite,
              id: edge.node.id,
            });
            idExists.push(edge.node.id);
          }
        }
      });
    }

    return formatedArray;
  }
  /**
  *  @param {string} key
  *  triggers file favorite mutation
  */
  handleFileFavoriting(key) {
    const fileItem = this.props.files.edges.filter(edge => edge && (edge.node.key === key))[0];

    if (!fileItem.node.isFavorite) {
      AddFavoriteMutation(
        this.props.favoriteConnection,
        this.props.connection,
        this.props.parentId,
        this.state.owner,
        this.state.labbookName,
        key,
        '',
        false,
        fileItem,
        this.props.section,
        (response, error) => {
          if (error) {
            console.error(error);
            setErrorMessage(`ERROR: could not add favorite ${key}`, error);
          }
        },
      );
    } else {
      RemoveFavoriteMutation(
        this.props.favoriteConnection,
        this.props.parentId,
        this.state.owner,
        this.state.labbookName,
        this.props.section,
        key,
        fileItem.node.id,
        fileItem,
        this.props.favorites,
        (response, error) => {
          if (error) {
            console.error(error);
          }
        },
      );
    }
  }
  /**
  *  @param {object} file
  *  gets a file object with name, extension, key, url properties
  *  sets as selected item
  */
  openDetailPanel(file) {
    this.setState({
      selectedFile: file,
    });
    setUpdateDetailView(true);
  }
  /**
  *  @param {}
  *  continues file upload
  *
  */
  _continueUpload() {
    setPauseUpload(false);
    const {
      files, count, prefix, totalFiles,
    } = store.getState().fileBrowser;
    const { connection, section, parentId } = this.props;
    const { owner, labbookName } = this.state;

    FolderUpload.uploadFiles(
      files,
      prefix,
      labbookName,
      owner,
      section,
      connection,
      parentId,
      this._chunkLoader,
      totalFiles,
      count,
    );

    if (store.getState().fileBrowser.chunkUploadData.data) {
      const { chunkUploadData } = store.getState().fileBrowser;

      this._chunkLoader(chunkUploadData.data, () => {}, chunkUploadData.chunkData.chunkIndex);
    }
    setPauseUploadData([], 0, '', '', 0);
    setResetChunkUpload();
  }

  /**
  *  @param {}
  *  cancels file upload but keeps files already uploaded and commits them
  *
  */
  _cancelKeep() {
    const { connection } = this.props;
    const { owner, labbookName } = this.state;
    const { transactionId } = store.getState().fileBrowser;
    setPauseUpload(false);
    const uploadData = store.getState().footer.uploadStack[0];
    setUploadMessageRemove('', uploadData.id, 0);

    CompleteBatchUploadTransactionMutation(
      connection,
      owner,
      labbookName,
      true,
      false,
      transactionId,
      (response, error) => {

      },
    );
  }

  /**
  *  @param {}
  *  cancels file upload and removes files that have been uploaded
  *
  */
  _cancel() {
    const { connection } = this.props;
    const { owner, labbookName } = this.state;
    const { transactionId } = store.getState().fileBrowser;
    setPauseUpload(false);
    const uploadData = store.getState().footer.uploadStack[0];
    setUploadMessageRemove('', uploadData.id, 0);

    CompleteBatchUploadTransactionMutation(
      connection,
      owner,
      labbookName,
      true,
      true,
      transactionId,
      (response, error) => {

      },
    );
  }

  render() {
    const files = this._formatFileJson(this.props.files);

    return (
      <div id="code" className="Code flex flex-row justify-center">

        <FileBrowser
          ref={this.props.connection}
          key={this.props.connection}
          keyPrefix={this.props.connection}
          connectionKey={this.props.connection}
          files={files}
          toggleFolder={this.toggleFolder}
          openDetailPanel={this.openDetailPanel}
          rootFolder={this.props.section}
          onCreateFolder={this.handleCreateFolder}
          onCreateFiles={this.handleCreateFiles}
          onMoveFolder={this.handleRenameFolder}
          onMoveFile={this.handleRenameFile}
          onRenameFolder={this.handleRenameFolder}
          onRenameFile={this.handleRenameFile}
          onDeleteFolder={this.handleDeleteFolder}
          onDeleteFile={this.handleDeleteFile}
          onFileFavoriting={this.handleFileFavoriting}
          owner={this.state.owner}
        />
        {
          this.state.uploading &&
          <div className="Code--uploading flex">
            Uploading Files...
            <span className="Code__loading--browser" />
          </div>
        }
        {
          this.props.isLocked.locked &&
          <div className="Code--uploading flex">
            Please wait for Project to finish {this.props.isLocked.isPublishing ? 'publishing' : this.props.isLocked.isExporting ? 'exporting' : 'syncing'}.
            <span className="Code__loading--browser" />
          </div>
        }

        <DetailPanel
          {...this.state.selectedFile}
        />

        {
          this.state.fileSizePromptVisible &&
          [
            <div
              key="FileBrowserLargeCodeUpload"
              className="FileBrowser__modal"
            >
              <div
                className="FileBrowser__close-modal"
                onClick={() => this._cancelUpload()}
              />
              <h5 className="FileBrowser__header">Large File Warning</h5>

              <div className="FileBrowser__body">

                <p>You're uploading some large files to the Code Section, are you sure you don't want to place these in the Input Section? Note, putting large files in the Code Section can hurt performance.</p>

                <div className="FileBrowser__button-container">

                  <button
                    className="button--flat"
                    onClick={() => this._cancelUpload()}
                  >Cancel Upload
                  </button>

                  <button onClick={() => this._userRejectsUpload()}>Skip Large Files</button>

                  <button onClick={() => this._userAcceptsUpload()}>Continue Upload</button>

                </div>

              </div>

            </div>,

            <div
              key="FileBrowserLargeCodeUploadCover"
              className="modal__cover"
            />,
          ]
        }

        {this.state.pause &&
          [<Modal
            key="cancelUploadModal"
            header="Cancel Upload"
            icon={null}
            size="medium"
            handleClose={() => { this._continueUpload(); }}
            renderContent={() =>
              (<div className="FileBrowser__cancel-content">
                <p>Upload has been paused, choose an action from the following options.</p>
                <div className="FileBrowser__cancel-buttons">
                  <button onClick={() => this._continueUpload()}>Dismiss and Continue</button>
                  <button onClick={() => this._cancelKeep()}>Cancel and Keep Uploaded</button>
                  <button onClick={() => this._cancel()}>Cancel upload</button>
                </div>
               </div>)
            }
          />,

            <div
              key="FileBrowserCancelCover"
              className="modal__cover"
            />,

            ]
          }

      </div>
    );
  }
}
