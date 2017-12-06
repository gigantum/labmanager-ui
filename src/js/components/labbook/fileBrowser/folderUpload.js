//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

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

          resolve({data: response.data, variables: variables})
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

const FolderUpload = {
  /**
  *  @param {array, string, string, string} files,prefix,labbbookName,section
  *  sorts files and folders
  *  checks if files and folders exist
  *  uploads file and folder if checks pass
  *  @return {boolean}
  */
  uploadFiles: (files, prefix, labbookName, section) =>{
    let index = 0;
    let existingPaths = []

    function fileCheck(fileItem){
      index++
      let filePath = fileItem.entry.fullPath.replace('/' + fileItem.file.name, '')
      const path = prefix !== '/' ? prefix + filePath.slice(1, filePath.length) : filePath.slice(1, filePath.length)
      const folderNames = path.split('/')

      let folderPaths = []

      folderNames.forEach((folderName, index)=>{
          if(index > 0){
            folderPaths.push(folderPaths[index - 1] + '/' + folderName)
          }else{
            folderPaths.push(((folderName + '/') === prefix) ? folderName : prefix + folderName)
          }
      })

      let all = []
      folderPaths.forEach((folderPath)=>{
        const variables = {labbookName: labbookName, path: path, owner: localStorage.getItem('username')};

        let promise = checkIfFolderExists(variables, section)

        all.push(promise)

      })

      Promise.all(all).then((labbooks)=>{
        labbooks.forEach((labbook)=>{

        })

        if(index < files.length){
          fileCheck(files[index])
        }
      })
    }

    fileCheck(files[index])


  }
}

export default FolderUpload
