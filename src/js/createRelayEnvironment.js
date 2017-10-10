
const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime')

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables
) {

  let queryString = operation.text;//.replace(/(\r\n|\n|\r)/gm,"");
  console.log(uploadables)

  let json = JSON.stringify({
    query: queryString,
    variables,
    archiveFile: uploadables
  })

  let headers = {
      'accept': '*/*',
      'Access-Control-Allow-Origin': '*'
  }
  if(uploadables === undefined){
    headers['content-type'] = 'application/json';
  }
  let formData = new FormData()
  formData.append('query', queryString)
  formData.append('variables', JSON.stringify(variables))
  formData.append('archiveFile', uploadables)
  console.log(formData)
  return fetch(process.env.GIGANTUM_API, {
    'method': 'POST',
    'headers': headers,
    'body': (uploadables === undefined) ? json : formData,
  }).then(response => {
    return response.json()
  }).catch(error => {

    if(error.message === 'Failed to fetch'){
      if(document.getElementById('apiDown') === undefined){
        let apiDown = document.createElement('div')
        apiDown.id = 'apiDown'
        apiDown.innerHTML = 'Connection Error: Verify labmanager contianer is running.'
        apiDown.classList.add('ApiDown')
        document.getElementById('root').appendChild(apiDown)
      }else{
        document.getElementById('apiDown').classList.remove('hidden')
      }
    }else{
      if(document.getElementById('apiDown')){
        document.getElementById('apiDown').classList.add('hidden')
      }
    }
    return error
  });

}

const network = Network.create(fetchQuery);
const handlerProvider = null;

const source = new RecordSource()
const store = new Store(source)
export default new Environment({
  handlerProvider,
  network,
  store,
})
