
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

  let queryString = operation.text.replace(/(\r\n|\n|\r)/gm,"");
  let body;

  let headers = {
      'accept': '*/*',
      'Access-Control-Allow-Origin': '*'
  }

  if(uploadables === undefined){

    headers['content-type'] = 'application/json';

    body = JSON.stringify({
      query: queryString,
      variables,
      archiveFile: uploadables
    })
  }else{

    body = new FormData()
    body.append('query', queryString)
    body.append('variables', JSON.stringify(variables))
    body.append('archiveFile', uploadables)
  }


  return fetch(process.env.GIGANTUM_API, {
    'method': 'POST',
    'headers': headers,
    'body': body,
  }).then(response => {
    return response.json()
  }).catch(error => {

    if(error.message === 'Failed to fetch'){
      document.getElementById('apiDown').classList.remove('hidden')
    }else{
      document.getElementById('apiDown').classList.add('hidden')
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

export {network, fetchQuery}
