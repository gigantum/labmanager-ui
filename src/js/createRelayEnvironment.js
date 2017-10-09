
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
  var queryString = operation.text.replace(/(\r\n|\n|\r)/gm,"");

  return fetch(process.env.GIGANTUM_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      query: queryString,
      variables
    }),
  }).then(response => {
    return response.json()
  }).catch(error => {

    if(error.message === 'Failed to fetch'){
      let apiDown = document.createElement('div')
      apiDown.innerHTML = 'Api failed to respond';
      apiDown.classList.add('ApiDown')
      document.getElementById('root').appendChild(apiDown)
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
