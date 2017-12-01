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

const checkIfFolderExists = (variables, section) => {

  let promise = new Promise((resolve, reject) =>{

    let fetchData = function(){

      fetchQuery(fileExistenceQuery(), variables).then((response) => {
          console.log(response)
        if(response.data){

          resolve(response.data)
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
  uploadFiles: (files, prefix, labbookName, section) =>{
    let index = 0;
    let existingPaths = []
    console.log(files, prefix, labbookName, section)
    function fileCheck(fileItem){
      index++
      console.log(fileItem)
      let filePath = fileItem.entry.fullPath.replace('/' + fileItem.file.name, '')
      const path = prefix !== '/' ? prefix + filePath.slice(1, filePath.length) : filePath.slice(1, filePath.length)
      const folderNames = path.split('/')
      console.log(folderNames)
      let folderPaths = []

      folderNames.forEach((folderName, index)=>{
          if(index > 0){
            folderPaths.push(folderPaths[index - 1] + '/' + folderName)
          }else{
            folderPaths.push(((folderName + '/') === prefix) ? folderName : prefix + folderName)
          }
      })

      console.log(folderPaths)

      let all = []
      folderPaths.forEach((folderPath)=>{
        const variables = {labbookName: labbookName, path: path, owner: localStorage.getItem('username')};

        let promise = checkIfFolderExists(variables, section)

        all.push(promise)

      })

      Promise.all(all).then((labbooks)=>{
        console.log(labbooks)
        // if(labbook[section] === null){
        //   let path = filePath.slice(1, filePath.length)
        // }

        if(index < files.length){
          fileCheck(files[index])
        }
      })
    }

    fileCheck(files[index])


  }
}

export default FolderUpload
