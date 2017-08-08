import CONFIG from './config'
const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime')

function fetchQuery(
  operation,
  variables,
) {

  //var myHeaders = new Headers();
  //myHeaders.append("Content-Type", "text/plain");
  // myHeaders.append("Content-Length", content.length.toString());
  // myHeaders.append("X-Custom-Header", "ProcessThisImmediately")

//http://localhost.charlesproxy.com/
  var queryString = operation.text.replace(/(\r\n|\n|\r)/gm,"");
  console.log(variables)
  console.log(queryString)
  return fetch(process.env.GIGANTUM_API, {//process.env.GIGANTUM_API
    method: 'POST',
    //mode: 'no-cors',
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      query: queryString,
      variables
    }),
  }).then(response => {
    console.log(response.status)
    return response.json()
  }).catch(error => {console.log(error, error.message, error.name, error.stack)})
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
