//vendor
import uuidv4 from 'uuid/v4'
//utils
import JobStatus from './JobStatus'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'
import AddLabbookFileMutation from 'Mutations/AddLabbookFileMutation'
let requestFlag = false;
let uploadAttempts = 0;
const uploadLabbookChunk = (file, chunk, accessToken, username, filepath, getChunkCallback, componentCallback) => {


  ImportLabbookMutation(username, username, chunk.blob, chunk, accessToken, (result, error)=>{
      requestFlag = true;
      uploadAttempts = 0;
      // console.log(result, error)
      if(result && (error === undefined)){
        getChunkCallback(file, result)
      }else{
        getChunkCallback(error)
      }

  })

}

const uploadFileBrowserChunk = (data, file, chunk, accessToken, username, filepath, getChunkCallback, componentCallback) => {
  console.log(
    data.connectionKey,
    username,
    username,
    data.labbookName,
    data.labbookId,
    filepath,
    chunk,
    accessToken
  )
  AddLabbookFileMutation(
    data.connectionKey,
    username,
    username,
    data.labbookName,
    data.labbookId,
    filepath,
    chunk,
    accessToken,
    (result, error)=>{
      console.log(result, error)
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
          chunkSize = 1000 * 1000 * 48,
          fileSize = file.size,
          fileSizeKb = Math.round(fileSize/1000);

    let fileLoadedSize = 0,
        chunkIndex = 0,
        totalChunks = Math.ceil(file.size/chunkSize);

    /*
      @param{object, object} response result
    */

    const getChunk = (response, result) => {

      if(response.name && (uploadAttempts < 4)){ //checks if response is a file

        let sliceUpperBound = (fileSize > (fileLoadedSize + chunkSize))
            ? (fileLoadedSize + chunkSize)
            : ((fileSize - fileLoadedSize) + fileLoadedSize),
            blob = file.slice(fileLoadedSize, sliceUpperBound)

        fileLoadedSize = fileLoadedSize + chunkSize;

        chunkIndex++

        let chunkData =   {
            blob: blob,
            fileSizeKb: Math.round(fileSizeKb/1000, 10) ,
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
              username,
              filepath,
              getChunk,
              componentCallback
            )
            let uploadLabbookChunkCounter = 0;

            let uploadInterval = setInterval(()=>{

              uploadLabbookChunkCounter += 5;

              if(uploadLabbookChunkCounter > 60){
                uploadAttempts++;
                uploadLabbookChunk(
                  file,
                  chunkData,
                  data.accessToken,
                  username,
                  filepath,
                  getChunk,
                  componentCallback
                )
                clearInterval(uploadInterval);
              }

              if(requestFlag){
                clearInterval(uploadInterval);
                requestFlag = false
              }
            }, 5000);


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
        if(uploadAttempts > 2){
          console.log('Too Many Failed Attempts')
          componentCallback([{message: 'Too many failed attempts'}])
        }else{
          componentCallback(response)
        }
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
  console.log(evt)
  evt.preventDefault();
  ChunkUploader.chunkFile(evt.data)
}
export default ChunkUploader
