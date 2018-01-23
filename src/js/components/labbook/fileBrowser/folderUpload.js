//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation';
import ChunkUploader from 'JS/utils/ChunkUploader'
//store
import store from 'JS/redux/store'

const fileExistenceQuery = graphql`
  query folderUploadQuery($labbookName: String!, $owner: String!, $path: String!){
    labbook(name: $labbookName, owner: $owner){
      id
      code{
        files(root: $path, first:1){
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

            store.dispatch({
              type: 'UPLOAD_MESSAGE_UPDATE',
              payload: {
                uploadMessage: `ERROR: cannot upload`,
                uploadError: true,
                id: labbookName + path

              }
            })
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `ERROR: could not make ${path}`,
                messagesList: error
              }
            })
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

  files.forEach((file, count) =>{

  let fileReader = new FileReader();

  fileReader.onloadend = function (evt) {

    let filePath = (prefix !== '/') ? prefix + file.entry.fullPath : file.entry.fullPath;
    if(filePath.indexOf('/') === 0){
      filePath = filePath.replace('/', '')
    }
    let data = {
        file: file.file,
        filepath: filePath,
        username: owner,
        accessToken: localStorage.getItem('access_token'),
        connectionKey: connectionKey,
        labbookName: labbookName,
        parentId: sectionId,
        section: section
      }

      chunkLoader(filePath, file, data, true, files, count)
    }

    fileReader.readAsArrayBuffer(file.file);
  });
}
/**
*  @param {array} folderNames
*  gets every possible folder combinations for a filepath
*  input [root,folder,subfolder] => root/folder/subfolder/
*  output [root, root/folder, root/folder/subfolder]
*  @return {array}
*/
const getFolderPaths = (folderNames, prefix) =>{
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

  return folderPaths

}

/**
* @param {array, string, string, string, string} folderPaths,labbookName,owner,path,section
* created a promise that checks it folder exists
* pushes promise into an array all
*/
const getFolderExistsQueryPromises = (folderPaths, labbookName, owner, section) =>{
  let all = []
  folderPaths.forEach((folderPath)=>{
    const variables = {labbookName: labbookName, path: folderPath, owner: owner, section: section};

    let promise = checkIfFolderExists(variables, section)

    all.push(promise)

  })

  return all
}

/**
* @param {array,string,string,string,string} folderPaths,labbookName,owner,path,section
* created a promise that checks it folder exists
* pushes promise into an array all
*/
const getMakeDirectoryPromises = (labbooks, labbookName, owner, path, section, connectionKey, sectionId, existingPaths) =>{
  let directoryAll = []

  labbooks.forEach((response)=>{

    if(response.labbook[section].files === null){
      let directoryPromise = makeDirectory(
          connectionKey,
          owner,
          labbookName,
          sectionId,
          path,
          section)

      directoryAll.push(directoryPromise)
    }else{
      existingPaths.push(path)
    }
  })

  return directoryAll
}

const FolderUpload = {
  /**
  *  @param {array, string, string, string} files,prefix,labbbookName,section
  *  sorts files and folders
  *  checks if files and folders exist
  *  uploads file and folder if checks pass
  *  @return {boolean}
  */
  uploadFiles: (files, prefix, labbookName, owner, section, connectionKey, sectionId, chunkLoader) =>{
    let count = 0;//
    let existingPaths = []
    let filePaths = []
    /**
    *  @param {object} fileItem
    *  recursive function that loops through a object that replicates a folders structure
    *  pushes fileItems into an array to make a flat keyed structure - similar to s3
    *  @return {boolean}
    */
    function fileCheck(fileItem){
      filePaths.push(fileItem)
      count++

      if(fileItem && fileItem.entry){
        let filePath = fileItem.entry.fullPath.replace('/' + fileItem.file.name, '')
        const path = prefix !== '/' ? prefix + filePath.slice(1, filePath.length) : filePath.slice(1, filePath.length)
        const folderNames = path.split('/')

        let folderPaths = getFolderPaths(folderNames, prefix);

        let directoryExistsAll = getFolderExistsQueryPromises(folderPaths, labbookName, owner, section)

        Promise.all(directoryExistsAll).then((labbooks)=>{
          let directoryAll = []

          labbooks.forEach((response)=>{

            if(response.labbook[section].files === null){
              let directoryPromise = makeDirectory(
                  connectionKey,
                  owner,
                  labbookName,
                  sectionId,
                  path,
                  section)

              directoryAll.push(directoryPromise)
            }else{
              existingPaths.push(path)
            }
          })

          if(directoryAll.length < 1){

            addFiles(filePaths,
              connectionKey,
              owner,
              labbookName,
              sectionId,
              path,
              section,
              prefix,
              chunkLoader)

            filePaths = [];//must empty file list for nested files

            if(count < files.length){
              fileCheck(files[count])
            }
          }
          else{

            Promise.all(directoryAll).then((result) =>{
              addFiles(filePaths,
              connectionKey,
              owner,
              labbookName,
              sectionId,
              path,
              section,
              prefix,
              chunkLoader)
              filePaths = [];//must empty file list for nested files

              if(count < files.length){

                fileCheck(files[count])

              }
            })
          }


        })
      }else{
        if(fileItem){
          let filePath = fileItem.fullPath;
          const path = prefix !== '/' ? prefix + filePath.slice(1, filePath.length) : filePath.slice(1, filePath.length)
          const folderNames = path.split('/')

          let folderPaths = getFolderPaths(folderNames, prefix);

          let directoryExistsAll = getFolderExistsQueryPromises(folderPaths, labbookName, owner, section)

          Promise.all(directoryExistsAll).then((labbooks)=>{
            let index = 0;
            function iterate(response){
              if(response.labbook[section].files === null){
                makeDirectory(
                    connectionKey,
                    owner,
                    labbookName,
                    sectionId,
                    response.variables.path,
                    section)
                    .then((result)=>{
                      index++

                      if(labbooks[index]){
                        iterate(labbooks[index])
                      }else{
                        fileCheck(files[count])
                      }

                      existingPaths.push(response.variables.path)
                  })

              }else{
                index++;
                if(index > labbooks.length){
                  fileCheck(files[count])
                }else{
                  iterate(labbooks[index])
                }
                existingPaths.push(response.variables.path)
              }
            }

            iterate(labbooks[index])
          })
        }
      }
    }

    fileCheck(files[count])


  }
}

export default FolderUpload
