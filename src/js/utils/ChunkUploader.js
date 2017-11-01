//vendor
import uuidv4 from 'uuid/v4'
//utils
import JobStatus from './JobStatus'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'

const uploadChunk = (file, chunk, filepath, callback) => {
  console.log(chunk)

  let username = localStorage.getItem('username');
  console.log(chunk.blob)
  ImportLabbookMutation(username, username, chunk.blob, chunk, (result, error)=>{
      if(result === null){
        callback(file)
        let filename = filepath.split('/')[filepath.split('/').length -1]
        let route = filename.split('_')[0]

        //this.props.history.replace(`/labbooks/${route}`)
      }else{
        callback(false)
        console.log(result, error)
      }

  })

}


const ChunkUploader = {

  chunkFile: (file, filepath) => {

    const id = uuidv4(),
          chunk = 1024 * 1024 * 4,
          fileSize = file.size;

    let fileLoadedSize = 0,
        chunkIndex = 1,
        totalChunks = Math.ceil(file.size/chunk);


    function getChunk(file){
      if(file){

        let sliceUpperBound = (fileSize > (fileLoadedSize + chunk)) ? (fileLoadedSize + chunk) : ((fileSize - fileLoadedSize) + fileLoadedSize)

        let blob = file.slice(fileLoadedSize, sliceUpperBound)
        let chunkSize = sliceUpperBound - fileLoadedSize;

        fileLoadedSize = fileLoadedSize + chunk;
        chunkIndex++

        if(sliceUpperBound <= fileSize){
          uploadChunk(
            file,
            {
              blob:blob,
              fileSize: fileSize,
              chunkSize: chunkSize,
              totalChunks: totalChunks,
              chunkIndex: chunkIndex - 1,
              filename: file.name,
              uploadId: id
            },
            filepath,
            getChunk
          )

        }
      }
    }

    getChunk(file)

  }
}

export default ChunkUploader
