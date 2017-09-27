var localStorageMock = (function() {
  var store = {};
  var jwt = require('jsonwebtoken');
  var token = jwt.sign({ foo: 'bar', exp: Math.floor(Date.now() / 1000) + 3000 }, 'shhhhh');

  var date = new Date();
  var d = new Date(date.getMilliseconds() + 100)

  store = {
    'id_token':  token,
    'expires_at': d.getTime()
  };

  return {
    getItem: function(key) {
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
