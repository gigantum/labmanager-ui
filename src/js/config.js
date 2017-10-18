const CONFIG = {
  'api': process.env.NODE_ENV,
  'dev':{
    'api': 'http://127.0.0.1:10001/labbook/'
  },
  'prod':{
    'api': 'http://localhost:10001/labbook/'
  },
  'navigation_items': [
    {id:'overview', name: 'Overview'},
    {id:'notes', name: 'Activity', 'fragment': '...Notes_labbook'},
    {id:'environment', name: 'Environment', 'fragment': '...Environment_labbook'},
    {id:'code', name: 'Code'},
    {id:'data', name: 'Data'}
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
