//vendor
import uuidv4 from 'uuid/v4'
//utils
import JobStatus from './JobStatus'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'
import AddLabbookFileMutation from 'Mutations/fileBrowser/AddLabbookFileMutation'
import store from 'JS/redux/store'

/*

*/
const uploadLabbookChunk = (file, chunk, accessToken, getChunkCallback) => {

  ImportLabbookMutation(chunk.blob, chunk, accessToken, (result, error)=>{

      if(result && (error === undefined)){
        getChunkCallback(file, result)
      }else{
        getChunkCallback(error)
      }

  })

}

const uploadFileBrowserChunk = (data, file, chunk, accessToken, username, filepath, section, getChunkCallback, componentCallback) => {

  AddLabbookFileMutation(
    data.connectionKey,
    username,
    data.labbookName,
    data.parentId,
    filepath,
    chunk,
    accessToken,
    section,
    (result, error)=>{

      if(result && (error === undefined)){
        getChunkCallback(file, result)
        let fileCount = store.getState().footer.fileCount + 1
        let totalFiles = store.getState().footer.totalFiles

        store.dispatch({
          type: 'UPLOAD_MESSAGE_UPDATE',
          payload:{
            uploadMessage: `Uploaded ${fileCount} of ${totalFiles} files`,
            fileCount: (store.getState().footer.fileCount + 1),
            progessBarPercentage: ((fileCount/totalFiles) * 100),
            error: false,
            open: true
          }
        })

        if(fileCount === totalFiles){
          setTimeout(()=>{
            store.dispatch({
              type: 'UPLOAD_MESSAGE_REMOVE',
              payload:{
                uploadMessage: `Uploaded ${fileCount} of ${totalFiles} files`,
                fileCount: (store.getState().footer.fileCount + 1),
                progessBarPercentage: ((fileCount/totalFiles) * 100),
                error: false,
                open: false
              }
            })
          }, 2000)
        }
      }else{
        getChunkCallback(error)
      }

  })

}

const ChunkUploader = {
  /*
    @param {object} data includes file filepath username and accessToken
  */
  chunkFile: (data, postMessage) => {

    let file = data.file,
      filepath = data.filepath,
      username = data.username,
      section = data.section,
      componentCallback = (response) => { //callback to trigger postMessage from initializer
        postMessage(response);
      }

    const id = uuidv4(),
          chunkSize = 1000 * 1000 * 48,
          fileSize = file.size,
          fileSizeKb = Math.round(fileSize/1000, 10);

    let fileLoadedSize = 0,
        chunkIndex = 0,
        totalChunks = (file.size === 0) ? 1 : Math.ceil(file.size/chunkSize);

    /*
      @param{object, object} response result
    */

    const getChunk = (response, result) => {


      if(response.name){ //checks if response is a file

        let sliceUpperBound = (fileSize > (fileLoadedSize + chunkSize))
            ? (fileLoadedSize + chunkSize)
            : ((fileSize - fileLoadedSize) + fileLoadedSize),
            blob = file.slice(fileLoadedSize, sliceUpperBound)

        fileLoadedSize = fileLoadedSize + chunkSize;

        chunkIndex++

        let chunkData =   {
            blob: blob,
            fileSizeKb: fileSizeKb,
            chunkSize: chunkSize,
            totalChunks: totalChunks,
            chunkIndex: chunkIndex - 1,
            filename: file.name,
            uploadId: id
          }

        if(chunkIndex <= totalChunks){ //if  there is still chunks to process do next chunk
          //select type of mutation
          if(file.name.indexOf('.lbk') > -1){

            uploadLabbookChunk(
              file,
              chunkData,
              data.accessToken,
              getChunk
            )


            postMessage(chunkData) //post progress back to worker instantiator file

          }
          else{
            uploadFileBrowserChunk(
              data,
              file,
              chunkData,
              data.accessToken,
              username,
              filepath,
              section,
              getChunk,
              componentCallback
            )

            postMessage(chunkData)
          }

        }else if(result){ //completes chunk upload task

          componentCallback(result)
        }else{ //chunk upload fails
          componentCallback(response)
        }
      }else{ //chunk upload fails

        componentCallback(response)

      }
    }

    getChunk(file)

  }
}
/*
  @param: {event} evt
  waits for data to be passed before starting chunking
*/

export default ChunkUploader
