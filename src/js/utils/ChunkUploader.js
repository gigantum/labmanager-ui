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
      if(result){
        JobStatus.getJobStatus(result.importLabbook.importJobKey).then((response)=>{

          // this.setState({
          //   message: 'Lab Book Import ' + response.jobStatus.status.toUpperCase(),
          //   show: (response.jobStatus.status === 'failed'),
          //   type: (response.jobStatus.status === 'failed') ? 'error': 'success'
          // })
          //
          // this._clearState()
          console.log(response.jobStatus.status)
          if(response.jobStatus.status === 'finished'){
            callback(file)
            let filename = filepath.split('/')[filepath.split('/').length -1]
            let route = filename.split('_')[0]

            //this.props.history.replace(`/labbooks/${route}`)
          }else if(response.jobStatus.status === 'failed'){
            callback(false)
          }

        }).catch((error)=>{
          callback(false);
          console.error(error)
          //this._clearState()
        })
      }else{
        callback(false);
        console.error(error)
        //this._clearState()
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
