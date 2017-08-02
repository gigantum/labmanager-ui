const CONFIG = {
  'api': process.env.NODE_ENV,
  'dev':{
    'api': 'http://127.0.0.1:5000/labbook/'
  },
  'prod':{
    'api': 'http://api.localhost/labbook/'
  },
  'navigation_items': [
    {'id':'notes', 'name': 'Notes'},
    {'id':'environment', 'name': 'Environment'},
    {'id':'code', 'name': 'Code'},
    {'id':'worflow', 'name': 'Workflow'},
    {'id':'input-data', 'name': 'Input Data'},
    {'id':'output-data', 'name': 'Output Data'}
  ]
}

export default CONFIG
