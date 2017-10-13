const CONFIG = {
  'api': process.env.NODE_ENV,
  'dev':{
    'api': 'http://127.0.0.1:5000/labbook/'
  },
  'prod':{
    'api': 'http://api.localhost/labbook/'
  },
  'navigation_items': [
    {id:'overview', name: 'Overview'},
    {id:'notes', name: 'Activity', 'fragment': '...Notes_labbook'},
    {id:'environment', name: 'Environment', 'fragment': '...Environment_labbook'},
    {id:'code', name: 'Code'},
    {id:'inputData', name: 'Input Data'},
    {id:'outputData', name: 'Output Data'}
  ],
  'months': [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
}

export default CONFIG
