

function fetchQuery(
  apiURL,
) {

  let headers = {}
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  headers['Access-Control-Allow-Origin'] = '*';
  
  return fetch(apiURL, {
    'method': 'GET',
    'headers': headers
  }).then(response => response.json())
  .catch(error => error)
}

export default fetchQuery
