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

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "text/plain");
  // myHeaders.append("Content-Length", content.length.toString());
  // myHeaders.append("X-Custom-Header", "ProcessThisImmediately")


  var queryString = operation.text.replace(/(\r\n|\n|\r)/gm,"");
  return fetch(process.env.GIGANTUM_API, {
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
    console.log()
    return response.json()
  }).catch(error => {console.log(error)})
}

const network = Network.create(fetchQuery);
const handlerProvider = null;

const source = new RecordSource()
const store = new Store(source)
console.log(store, source)
export default new Environment({
  handlerProvider,
  network,
  store,
})
