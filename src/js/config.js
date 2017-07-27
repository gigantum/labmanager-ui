const CONFIG = {
  api: process.env.NODE_ENV,
  dev:{
    api: 'http://127.0.0.1:5000/labbook/'
  },
  prod:{
    api: 'http://api.localhost/labbook/'
  }
}

export default CONFIG
