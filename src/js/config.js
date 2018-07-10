import tips from './tips'

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
      'zip',
      'lbk',
      'pyc',
      'gitkeep'
    ]
  },

  containerStatus:{
    canEditEnvironment: (status) => {
      return (status === 'Stopped') || (status === 'Rebuild')
    }
  },
  userAPI: {
    getUsersQueryString: (userInput) => {
      const sanitizedUserInput = userInput.replace(/-/g, ' ')
      const apiURL = `https://m9eq4m3z0f.execute-api.us-east-1.amazonaws.com/prod?q=${sanitizedUserInput}*&q.options={fields: ['username^5','name']}&size=10`

      return encodeURI(apiURL)
    },
    getUserEmailQueryString: (email) => {
      const apiURL = `https://m9eq4m3z0f.execute-api.us-east-1.amazonaws.com/prod?q=${email}&q.options={fields: ['email']}&size=10`

      return encodeURI(apiURL)
    }
  },
  getToolTipText: (section) =>{
    return tips[section]
  },
  demoHostName: 'try.gigantum.com',
}

export default CONFIG
