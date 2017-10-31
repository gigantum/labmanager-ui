//vendor
import uuidv4 from 'uuid/v4'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'

const uploadChunk = (chunk) => {
  console.log(uuidv4, chunk)
}


const ChunkUploader = {

  chunkFile: (file) => {
    
    const id = uuidv4()
    const chunk = 1024 * 1024 * 4;
    const size = file.size;
    let fileLoadedSize = 0;
    let chunkNumber = 1;
    let totalChunks = Math.ceil(file.size/chunk);


    function getChunk(file){
      let sliceUpperBound = (size > (fileLoadedSize + chunk)) ? (fileLoadedSize + chunk) : ((size - fileLoadedSize) + fileLoadedSize)

      let blob = file.slice(fileLoadedSize, sliceUpperBound)

      uploadChunk({
        blob:blob,
        size: size,
        chunckSize: (sliceUpperBound - fileLoadedSize),
        totalChunks: totalChunks,
        chunkNumber: chunkNumber,
        fileName: file.name,
        id: id
      })

      fileLoadedSize = fileLoadedSize + chunk;

      if(size > sliceUpperBound){
        chunkNumber++
        getChunk(file, fileLoadedSize )
      }
    }

    getChunk(file)

  }
}

export default ChunkUploader
