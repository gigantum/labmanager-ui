//vendor
import {
  graphql,
} from 'react-relay'
import uuidv4 from 'uuid/v4'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation';
//store
import store from 'JS/redux/store'

const fileExistenceQuery = graphql`
  query folderUploadQuery($labbookName: String!, $owner: String!, $path: String!){
    labbook(name: $labbookName, owner: $owner){
      id
      code{
        files(rootDir: $path, first:1){
          edges{
            node{
              isDir,
              key
            }
          }
        }
      }
      input{
      	files(rootDir: $path, first: 1){
          edges{
            node{
              isDir,
              key
            }
          }
        }
      }
      output{
        files(rootDir: $path, first: 1){
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
                messageBody: error
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
chunkLoader,
transactionId,
chunckCallback) =>{

  files.forEach((file, count) =>{

  if(file){
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
          parentId: sectionId,
          connectionKey,
          labbookName,
          section,
          transactionId
        }


        chunkLoader(data, chunckCallback)
      }

      fileReader.readAsArrayBuffer(file.file);
    }
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
export const getMakeDirectoryPromises = (labbooks, labbookName, owner, path, section, connectionKey, sectionId, existingPaths) =>{
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

const onlyUnique = (value, index, self) =>  {
    let isUnique = (self.indexOf(value) === index)
    return isUnique;
}

const CreateFolders = (files, prefix, section, labbookName, owner, sectionId, connectionKey, fileCheck, totalFiles) => {
    let folderPaths = []
    let directoryExists = []

    files.forEach((fileItem)=>{


      let filePath = fileItem.entry ? fileItem.entry.fullPath : fileItem.fullPath;
      const fullPath = prefix !== '/' ? prefix + filePath.slice(1, filePath.length) : filePath.slice(1, filePath.length)

      let r = /[^/]*$/;
      const tempPath =  fileItem.entry.isDirectory ? fullPath : fullPath.replace(r, '');

      const path = (tempPath.indexOf(tempPath.length - 1)) === '/' ? tempPath.replace(tempPath.length -1, 1) : tempPath;

      const folderNames = path.split('/')

      folderPaths = folderPaths.concat(getFolderPaths(folderNames, prefix));
    })

    folderPaths = folderPaths.map((fpath)=>{
        let newPath = fpath[fpath.length -1] === '/'? fpath : fpath + '/'
        return newPath
    })

    let uniqueFolderPaths = folderPaths.filter( onlyUnique )

    let directoryExistsAll = getFolderExistsQueryPromises(uniqueFolderPaths, labbookName, owner, section)

    Promise.all(directoryExistsAll).then((labbooks)=>{
      let index = 0;

      function createFolder(response){
        index++
        if(labbooks[index]){
          createFolder(labbooks[index])
        }else{
          fileCheck(files[0])
          if(totalFiles === 0){
            store.dispatch({
              type: 'FINISHED_UPLOADING',
            })
          }
        }
      }

      createFolder(labbooks[index])
    })
}

const FolderUpload = {
  /**
  *  @param {array, string, string, string} files,prefix,labbbookName,section
  *  sorts files and folders
  *  checks if files and folders exist
  *  uploads file and folder if checks pass
  *  @return {boolean}
  */
  uploadFiles: (files, prefix, labbookName, owner, section, connectionKey, sectionId, chunkLoader, totalFiles, count) =>{

    let existingPaths = []
    let filePaths = []
    let batchCount = 0
    let batchCallbackCount = 0
    let transactionId = uuidv4()
    let isPaused = false;
    /**
    *  @param {object} fileItem
    *  recursive function that loops through a object that replicates a folders structure
    *  pushes fileItems into an array to make a flat keyed structure - similar to s3
    *  @return {boolean}
    */
    CreateFolders(files, prefix, section, labbookName, owner, sectionId, connectionKey, fileCheck, totalFiles)

    function fileCheck(fileItem){

      filePaths.push(fileItem)
      count++

      if(fileItem && fileItem.entry){
        if(fileItem.entry.isFile){
           if(!store.getState().fileBrowser.pause){
            batchCount++;
            new Promise(function(resolve, reject){

              addFiles([fileItem],
                connectionKey,
                owner,
                labbookName,
                sectionId,
                fileItem.file.name,
                section,
                prefix,
                chunkLoader,
                transactionId,
                (result, pause)=>{
                  isPaused = pause

                  if(!store.getState().fileBrowser.pause){


                    store.dispatch({
                      type: "PAUSE_UPLOAD_DATA",
                      payload:{
                        files,
                        count: count,
                        transactionId,
                        prefix,
                        totalFiles
                      }
                    })

                  }


                  if(result.addLabbookFile){

                    batchCallbackCount++

                    if(batchCount === batchCallbackCount){
                      batchCount = 0
                      batchCallbackCount = 0

                      if(!store.getState().fileBrowser.pause){
                        fileCheck(files[count])
                      }
                    }
                  }
                })

            })
          }
        }

       if(!store.getState().fileBrowser.pause){
          if(batchCount < 3){
            fileCheck(files[count])
          }
       }

      }else{
        if(fileItem){

          let filePath = fileItem.entry ?  fileItem.entry.fullPath : fileItem.fullPath;

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
  }
}

export default FolderUpload
