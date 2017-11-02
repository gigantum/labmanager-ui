//vendor
import uuidv4 from 'uuid/v4'
//utils
import JobStatus from './JobStatus'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'

const uploadChunk = (file, chunk, accessToken, username, filepath, getChunkCallback, componentCallback) => {

  ImportLabbookMutation(username, username, chunk.blob, chunk, accessToken, (result, error)=>{
      if(result && (error === undefined)){
        getChunkCallback(file, result)
      }else{
        getChunkCallback(error)
      }

  })

}



const ChunkUploader = {
  /*
    @param {object} data includes file filepath username and accessToken
  */
  chunkFile: (data) => {

    let file = data.file,
      filepath = data.filepath,
      username = data.username,
      componentCallback = (response) => { //callback to trigger postMessage from worker
        postMessage(response);
      }

    const id = uuidv4(),
          chunkSize = 1024 * 1024 * 48,
          fileSize = file.size,
          fileSizeKb = Math.round(fileSize/1024);

    let fileLoadedSize = 0,
        chunkIndex = 0,
        totalChunks = Math.ceil(file.size/chunkSize);

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
            fileSizeKb: Math.round(fileSizeKb/1024) ,
            chunkSize: chunkSize,
            totalChunks: totalChunks,
            chunkIndex: chunkIndex - 1,
            filename: file.name,
            uploadId: id
          }

        if(chunkIndex <= totalChunks){ //if  there is still chunks to process do next chunk
          uploadChunk(
            file,
            chunkData,
            data.accessToken,
            username,
            filepath,
            getChunk,
            componentCallback
          )

          postMessage(chunkData) //post progress back to worker instantiator file

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
onmessage = (evt) => {
  ChunkUploader.chunkFile(evt.data)
}
export default ChunkUploader
