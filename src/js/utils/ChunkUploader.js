//vendor
import uuidv4 from 'uuid/v4'
//utils
import JobStatus from './JobStatus'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'

const uploadChunk = (file, chunk, filepath, callback) => {
  console.log(chunk)

  let username = localStorage.getItem('username');

  ImportLabbookMutation(username, username, chunk.blob, chunk, (result, error)=>{
      console.log(result)
      if(result){
        callback(true)
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
        chunkIndex = 0,
        totalChunks = Math.ceil(file.size/chunk);

    console.time('chunk')
    function getChunk(nextChunk){
      console.log(nextChunk)
      if(nextChunk){

        let sliceUpperBound = (fileSize > (fileLoadedSize + chunk)) ? (fileLoadedSize + chunk) : ((fileSize - fileLoadedSize) + fileLoadedSize)

        let blob = file.slice(fileLoadedSize, sliceUpperBound)
        //let chunkSize = sliceUpperBound - fileLoadedSize;

        fileLoadedSize = fileLoadedSize + chunk;
        chunkIndex++

        if(chunkIndex <= totalChunks){
          uploadChunk(
            file,
            {
              blob:blob,
              fileSize: Math.round(fileSize/1024) ,
              chunkSize: chunk,
              totalChunks: totalChunks,
              chunkIndex: chunkIndex - 1,
              filename: file.name,
              uploadId: id
            },
            filepath,
            getChunk
          )

        }else{
          console.timeEnd('chunk')
          //componentCallback(true)
        }
      }
    }

    getChunk(file)

  }
}

export default ChunkUploader
