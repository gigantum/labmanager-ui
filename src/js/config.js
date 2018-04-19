const CONFIG = {
  'api': process.env.NODE_ENV,
  'navigation_items': [
    {id:'overview', name: 'Overview'},
    {id:'activity', name: 'Activity', 'fragment': '...Activity_labbook'},
    {id:'environment', name: 'Environment', 'fragment': '...Environment_labbook'},
    {id:'code', name: 'Code'},
    {id:'inputData', name: 'Input Data'},
    {id:'outputData', name: 'Output Data'}
  ],
  'modalNav': [
    {'id': 'createLabook', 'description': 'Title & Description'},
    {'id': 'selectBaseImage', 'description': 'Base Image'},
    {'id': 'selectDevelopmentEnvironment', 'description': 'Dev Environment'},
    {'id': 'addEnvironmentPackage', 'description': 'Add Dependencies'},
    {'id': 'addCustomDependencies', 'description': 'Custom Dependencies'},
    {'id': 'successMessage', 'description': 'Success'}
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
  ],
  'fileBrowser':{
    'excludedFiles': [
      'DS_Store',
      'lbk',
      'pyc',
      'gitkeep'
    ]
  },

  containerStatus:{
    canEditEnvironment: (status)=> {
      return (status === 'Stopped') || (status === 'Rebuild')
    }
  }
}

export default CONFIG
