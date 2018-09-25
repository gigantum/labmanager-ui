

function fetchQuery(apiURL) {
  const headers = {};
  headers.Accept = 'application/json';
  headers['Content-Type'] = 'application/json';
  headers['Access-Control-Allow-Origin'] = '*';

  return fetch(apiURL, {
    method: 'GET',
    headers,
  }).then(response => response.json())
    .catch(error => error);
}

export default fetchQuery;
