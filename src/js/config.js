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
  generateAvatar: (username) => {
    let a = 1, c = 0, h, o, b, d;
    let avatarColors = [
      '#324156',
      '#007DA7',
      '#17D7BE',
      '#E0EBF9',
      '#9984BC',
      '#703273',
      '#A3AAB2',
      '#6C6D6D',
    ]
    if (username) {
        a = 0;
        b = 0;
        /*jshint plusplus:false bitwise:false*/
        for (h = username.length - 1; h >= 0; h--) {
            o = username.charCodeAt(h);
            a = (a<<6&268435455) + o + (o<<14);
            b = (a<<2&845674878) + o + (o<<12);
            c = a & 266338304;
            d = b & 849451581;
            a = c!==0?a^c>>21:a;
            b = d!==0?b^d>>11:b;
        }
    }
    return {
      background: `linear-gradient(${a % 360}deg, ${avatarColors[a % 6]},  ${avatarColors[b % 6]}`,
    };
  },
}

export default CONFIG
