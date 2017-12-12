//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation';
import ChunkUploader from 'JS/utils/ChunkUploader'

const fileExistenceQuery = graphql`
  query folderUploadQuery($labbookName: String!, $owner: String!, $path: String!){
    labbook(name: $labbookName, owner: $owner){
      id
      code{
        files(root: $path, first: 1){
          edges{
            node{
              isDir,
              key
            }
          }
        }
      }
      input{
      	files(root: $path, first: 1){
          edges{
            node{
              isDir,
              key
            }
          }
        }
      }
      output{
        files(root: $path, first: 1){
          edges{
            node{
              isDir,
              key
            }
          }
        }
      }
    }
  }
`;

/**
*  @param {object, string} variables,section
*  checks if a folder or file exists
*  @return {promise}
*/
const checkIfFolderExists = (variables, section) => {

  let promise = new Promise((resolve, reject) =>{

    let fetchData = function(){

      fetchQuery(fileExistenceQuery(), variables).then((response) => {

        if(response.data){

          resolve({labbook: response.data.labbook, variables: variables})
        }else{
          reject(response.error)
        }
      }).catch((error) =>{
        console.log(error)
        reject(error)
      })
    }
    fetchData()

  })

  return promise
}

/**
*  @param {string, string, string, string, string, string} variables,section
*  checks if a folder or file exists
*  @return {promise}
*/
const makeDirectory = (
  connectionKey,
  owner,
  labbookName,
  sectionId,
  path,
  section) => {

  let promise = new Promise((resolve, reject) =>{

      MakeLabbookDirectoryMutation(
        connectionKey,
        owner,
        labbookName,
        sectionId,
        path,
        section,
        (response, error)=>{
          if(error){
            console.error(error)
            reject(error)
          }else{
            resolve(response)
          }
        }
      )
  })

  return promise
}

/**
*  @param {string, string, string, string, string, string} variables,section
*  checks if a folder or file exists
*  @return {promise}
*/
const addFiles = (files,
connectionKey,
owner,
labbookName,
sectionId,
path,
section,
prefix,
chunkLoader) =>{
  console.log(files,
  connectionKey,
  owner,
  labbookName,
  sectionId,
  path,
  section,
  chunkLoader)

  files.forEach((file, index) =>{

  let fileReader = new FileReader();

  fileReader.onloadend = function (evt) {

    let arrayBuffer = evt.target.result;
    let blob = new Blob([new Uint8Array(arrayBuffer)]);
    //complete the progress bar

      //this._importingState();

      let filePath = (prefix !== '/') ? prefix + file.entry.fullPath : file.entry.fullPath;
      let data = {
        file: file.file,
        filepath: filePath,
        username: localStorage.getItem('username'),
        accessToken: localStorage.getItem('access_token'),
        connectionKey: connectionKey,
        labbookName: labbookName,
        parentId: sectionId,
        section: section
      }

      console.log(filePath, file, data, true, files, index)
      chunkLoader(filePath, file, data, true, files, index)
    }

    fileReader.readAsArrayBuffer(file.file);
  });
}

const FolderUpload = {
  /**
  *  @param {array, string, string, string} files,prefix,labbbookName,section
  *  sorts files and folders
  *  checks if files and folders exist
  *  uploads file and folder if checks pass
  *  @return {boolean}
  */
  uploadFiles: (files, prefix, labbookName, section, connectionKey, sectionId, chunkLoader) =>{
    let index = 0;
    let existingPaths = []
    let filePaths = []

    function fileCheck(fileItem){
      index++
      let filePath = fileItem.entry.fullPath.replace('/' + fileItem.file.name, '')
      const path = prefix !== '/' ? prefix + filePath.slice(1, filePath.length) : filePath.slice(1, filePath.length)
      const folderNames = path.split('/')

      filePaths.push(fileItem)

      let folderPaths = []

      folderNames.forEach((folderName, index)=>{
          if(index > 0){
            let folderPath = folderPaths[index - 1] + '/' + folderName;
            if(folderPaths.indexOf(folderPath) <  0){
              folderPaths.push(folderPaths[index - 1] + '/' + folderName)
            }
          }else{
            let folderPath = ((folderName + '/') === prefix) ? folderName : prefix + folderName
            if(folderPaths.indexOf(folderPath) < 0 ){
              folderPaths.push(folderPath)
            }
          }
      })


      let all = []
      folderPaths.forEach((folderPath)=>{
        const variables = {labbookName: labbookName, path: path, owner: localStorage.getItem('username')};

        let promise = checkIfFolderExists(variables, section)

        all.push(promise)

      })

      Promise.all(all).then((labbooks)=>{
        let directoryAll = []
        labbooks.forEach((response)=>{


          console.log(response, section)
          if(response.labbook[section].files === null){
            let directoryPromise = makeDirectory(
                connectionKey,
                localStorage.getItem('username'),
                labbookName,
                sectionId,
                path,
                section)

            directoryAll.push(directoryPromise)
          }
        })

        if(directoryAll.length > 1){
          console.log(filePaths)

          addFiles(filePaths,
          connectionKey,
          localStorage.getItem('username'),
          labbookName,
          sectionId,
          path,
          section,
          prefix,
          chunkLoader)
        }
        else{
          Promise.all(directoryAll).then((result) =>{
            console.log(filePaths);
            addFiles(filePaths,
            connectionKey,
            localStorage.getItem('username'),
            labbookName,
            sectionId,
            path,
            section,
            prefix,
            chunkLoader)

          })
        }

        if(index < files.length){
          fileCheck(files[index])
        }
      })
    }

    fileCheck(files[index])


  }
}

export default FolderUpload
