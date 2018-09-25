import reduxStore from 'JS/redux/store';

const {
  Environment, Network, RecordSource, Store,
} = require('relay-runtime');

const parseParams = (str) => {
  let pieces = str.split('&'),
    data = {},
    i,
    parts;
  // process each query pair
  for (i = 0; i < pieces.length; i++) {
    parts = pieces[i].split('=');
    if (parts.length < 2) {
      parts.push('');
    }
    data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }
  return data;
};

function fetchQuery(operation, variables, cacheConfig, uploadables) {
  if (reduxStore.getState().login.logut && (operation.text.indexOf('RemoveUserIdentityMutation') === -1)) {
    return;
  }

  const queryString = operation.text.replace(/(\r\n|\n|\r)/gm, '');
  let body;
  const headers = {
    accept: '*/*',
  };

  if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  if (uploadables && uploadables[0]) {
    if (uploadables[1]) {
      const idToken = localStorage.getItem('id_token');
      headers.authorization = `Bearer ${uploadables[1]}`;
      headers.Identity = `${idToken}`;
    }
  } else if (window.location.href.indexOf('access_token') > -1) {
    const hashObj = parseParams(window.location.href.split('#')[1]);

    headers.authorization = `Bearer ${hashObj.access_token}`;
    headers.Identity = `${hashObj.id_token}`;

    localStorage.setItem('access_token', hashObj.access_token);
    localStorage.setItem('id_token', hashObj.id_token);

    window.location.hash = '';
  } else if (localStorage.getItem('access_token')) {
    const accessToken = localStorage.getItem('access_token');
    const idToken = localStorage.getItem('id_token');
    headers.authorization = `Bearer ${accessToken}`;
    headers.Identity = `${idToken}`;
  }

  if (uploadables === undefined) {
    headers['content-type'] = 'application/json';

    body = JSON.stringify({ query: queryString, variables });
  } else {
    body = new FormData();

    body.append('query', queryString);
    body.append('variables', JSON.stringify(variables));
    body.append('uploadChunk', uploadables[0]);
  }

  const apiHost = process.env.NODE_ENV === 'development'
    ? 'localhost:10000'
    : window.location.host;

  const apiURL = `${window.location.protocol}//${apiHost}${process.env.GIGANTUM_API}`;

  return fetch(apiURL, {
    method: 'POST',
    headers,
    body,
  }).then(response => response.json()).catch(error => error);
}

const network = Network.create(fetchQuery);
const handlerProvider = null;

const source = new RecordSource();
const store = new Store(source);
export default new Environment({ handlerProvider, network, store });

export {
  network,
  fetchQuery,
};
