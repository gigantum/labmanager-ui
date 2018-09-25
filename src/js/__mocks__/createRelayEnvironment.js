import rp from 'request-promise-native';

const {
  Environment,
  Network,
  RecordSource,
  Store,
} = require('relay-runtime');


function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables,
) {
  const queryString = operation.text.replace(/(\r\n|\n|\r)/gm, '');
  let body;

  const headers = {
    accept: '*/*',
    'Access-Control-Allow-Origin': '*',
  };

  if (uploadables && uploadables[0]) {
    if (uploadables[1]) {
      headers.authorization = `Bearer ${uploadables[1]}`;
    }
  } else if (localStorage.getItem('access_token')) {
    const accessToken = localStorage.getItem('access_token');
    headers.authorization = `Bearer ${accessToken}`;
  }

  const apiHost = process.env.NODE_ENV === 'development' ? 'localhost:10000' : window.location.host;
  const apiURL = `${window.location.protocol}//${apiHost}${process.env.GIGANTUM_API}`;
  if (uploadables === undefined) {
    headers['content-type'] = 'application/json';

    body = JSON.stringify({
      query: queryString,
      variables,
    });
    return fetch(apiURL, {
      method: 'POST',
      headers,
      body,
    }).then(response => response.json())
      .catch(error => error);
  }

  body = new FormData();

  body.append('query', queryString);
  body.append('variables', JSON.stringify(variables));
  body.append('uploadChunk', uploadables[0]);


  const options = {
    method: 'POST',
    uri: apiURL,
    formData: {
      body,
    },
    headers: {
      /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
    },
  };

  rp(
    options, response =>
    // POST succeeded..
      response.json()
    , error => error,
  );
}

const network = Network.create(fetchQuery);
const handlerProvider = null;

const source = new RecordSource();
const store = new Store(source);
export default new Environment({
  handlerProvider,
  network,
  store,
});

export { network, fetchQuery };
