
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

  if(uploadables && uploadables[0]){
    if(uploadables[1]){
      headers['authorization'] = `Bearer ${uploadables[1]}`
    }

  } else{
    if(localStorage.getItem('access_token')){
      const accessToken = localStorage.getItem('access_token')
      headers['authorization'] = `Bearer ${accessToken}`
    }
  }


  if(uploadables === undefined){

    headers['content-type'] = 'application/json';

    body = JSON.stringify({
      query: queryString,
      variables
    })
  }else{
    body = new FormData()
    body.append('query', queryString)
    body.append('variables', JSON.stringify(variables))
    body.append('uploadChunk', uploadables[0])
  }

  console.log(body, headers)
  return fetch(window.location.protocol + '//' + window.location.hostname + `${process.env.GIGANTUM_API}`, {
    'method': 'POST',
    'headers': headers,
    'body': body,
  }).then(response => response.json())
    .catch(error => error);

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
