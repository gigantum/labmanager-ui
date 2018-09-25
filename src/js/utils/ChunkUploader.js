// vendor
import uuidv4 from 'uuid/v4';
// mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation';
import AddLabbookFileMutation from 'Mutations/fileBrowser/AddLabbookFileMutation';
import CompleteBatchUploadTransactionMutation from 'Mutations/fileBrowser/CompleteBatchUploadTransactionMutation';
import store from 'JS/redux/store';
import { setUploadMessageUpdate, setUploadMessageRemove, setWarningMessage } from 'JS/redux/reducers/footer';
import { setFinishedUploading, setPauseChunkUpload } from 'JS/redux/reducers/labbook/fileBrowser/fileBrowserWrapper';

/**
  @param {number} bytes
  converts bytes into suitable units
*/
export const humanFileSize = (bytes) => {
  const thresh = 1000;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} kB`;
  }

  const units = ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
};


const uploadLabbookChunk = (file, chunk, accessToken, getChunkCallback) => {
  ImportLabbookMutation(chunk.blob, chunk, accessToken, (result, error) => {
    if (result && (error === undefined)) {
      getChunkCallback(file, result);
    } else {
      getChunkCallback(error);
    }
  });
};

const updateTotalStatus = (file, labbookName, owner, transactionId) => {
  const fileCount = store.getState().footer.fileCount + 1;
  const totalFiles = store.getState().footer.totalFiles;
  const progressBarPercentage = ((fileCount / totalFiles) * 100);
  setUploadMessageUpdate(`Uploaded ${fileCount} of ${totalFiles} files`, fileCount, progressBarPercentage);

  if (fileCount === totalFiles) {
    setTimeout(() => {
      setFinishedUploading();
      setUploadMessageRemove(`Uploaded ${fileCount} of ${totalFiles} files`, null, progressBarPercentage);
    }, 2000);

    CompleteBatchUploadTransactionMutation(
      'connectionKey',
      owner,
      labbookName,
      false,
      false,
      transactionId,
      (response, error) => {

      },
    );
  }
};

const updateChunkStatus = (file, chunkData, labbookName, owner, transactionId) => {
  const {
    fileSizeKb,
    chunkSize,
  } = chunkData;
  const chunkIndex = chunkData.chunkIndex + 1;
  const uploadedChunkSize = ((chunkSize / 1000) * chunkIndex) > fileSizeKb ? humanFileSize(fileSizeKb) : humanFileSize((chunkSize / 1000) * chunkIndex);
  const fileSize = humanFileSize(fileSizeKb);
  setUploadMessageUpdate(`${uploadedChunkSize} of ${fileSize} files`, 1, (((chunkSize * chunkIndex) / (fileSizeKb * 1000)) * 100));

  if ((chunkSize * chunkIndex) >= (fileSizeKb * 1000)) {
    setFinishedUploading();
    setTimeout(() => {
      setUploadMessageRemove(`Uploaded ${fileSizeKb} of ${fileSizeKb} files`, null, (100 * 100));
    }, 2000);

    CompleteBatchUploadTransactionMutation(
      'connectionKey',
      owner,
      labbookName,
      false,
      false,
      transactionId,
      (response, error) => {

      },
    );
  }
};


const uploadFileBrowserChunk = (data, chunkData, file, chunk, accessToken, username, filepath, section, getChunkCallback, componentCallback) => {
  if (!store.getState().fileBrowser.pause || (store.getState().footer.totalFiles > 1)) {
    AddLabbookFileMutation(
      data.connectionKey,
      username,
      data.labbookName,
      data.parentId,
      filepath,
      chunk,
      accessToken,
      section,
      data.transactionId,
      (result, error) => {
        setFinishedUploading();

        if (result && (error === undefined)) {
          getChunkCallback(file, result);

          if (store.getState().footer.totalFiles > 1) {
            const lastChunk = (chunkData.totalChunks - 1) === chunkData.chunkIndex;

            if (lastChunk) {
              updateTotalStatus(file, data.labbookName, username, data.transactionId);
            }
          } else {
            updateChunkStatus(file, chunkData, data.labbookName, username, data.transactionId);
          }
        } else {
          const errorBody = error.length && error[0].message ? error[0].message : error;
          setWarningMessage(errorBody);
        }
      },
    );
  } else if (chunk.fileSizeKb > (48 * 1000)) {
    setPauseChunkUpload(data, chunkData, section, username);
  }
};

const ChunkUploader = {
  /*
    @param {object} data includes file filepath username and accessToken
  */
  chunkFile: (data, postMessage, passedChunkIndex) => {
    let file = data.file,
      filepath = data.filepath,
      username = data.username,
      section = data.section,
      componentCallback = (response) => { // callback to trigger postMessage from initializer
        postMessage(response, false);
      };

    const id = uuidv4(),
      chunkSize = 1000 * 1000 * 48,
      fileSize = file.size,
      fileSizeKb = Math.round(fileSize / 1000, 10);

    let fileLoadedSize = 0,
      chunkIndex = passedChunkIndex || 0,
      totalChunks = (file.size === 0) ? 1 : Math.ceil(file.size / chunkSize);

    /*
      @param{object, object} response result
    */
    const getChunk = (response, result) => {
      if (response.name) { // checks if response is a file
        let sliceUpperBound = (fileSize > (fileLoadedSize + chunkSize))
            ? (fileLoadedSize + chunkSize)
            : ((fileSize - fileLoadedSize) + fileLoadedSize),
          blob = file.slice(fileLoadedSize, sliceUpperBound);

        fileLoadedSize += chunkSize;

        chunkIndex++;

        const chunkData = {
          blob,
          fileSizeKb,
          chunkSize,
          totalChunks,
          chunkIndex: chunkIndex - 1,
          filename: file.name,
          uploadId: id,
        };

        if (chunkIndex <= totalChunks) { // if  there is still chunks to process do next chunk
          // select type of mutation
          if (file.name.indexOf('.lbk') > -1 || file.name.indexOf('.zip') > -1) {
            if (!data.connectionKey) {
              uploadLabbookChunk(
                file,
                chunkData,
                data.accessToken,
                getChunk,
              );

              postMessage(chunkData, false); // post progress back to worker instantiator file
            }
          } else {
            // if(store.getState().fileBrowser.pause === false){
            uploadFileBrowserChunk(
              data,
              chunkData,
              file,
              chunkData,
              data.accessToken,
              username,
              filepath,
              section,
              getChunk,
              componentCallback,
            );

            postMessage(chunkData, false);
            // }else{
            //   postMessage(chunkData, true)
            // }
          }
        } else if (result) { // completes chunk upload task
          componentCallback(result);
        } else { // chunk upload fails
          componentCallback(response);
        }
      } else { // chunk upload fails
        componentCallback(response);
      }
    };

    getChunk(file);
  },
};
/*
  @param: {event} evt
  waits for data to be passed before starting chunking
*/

export default ChunkUploader;
