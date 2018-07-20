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
    let firstHash = 1, helper, usernameIndex, secondHash = 0;
    //color pallete
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
      firstHash = 0;
      //first hashing function, returns integer
      for (usernameIndex = username.length - 1; usernameIndex >= 0; usernameIndex--) {

          let char = username.charCodeAt(usernameIndex);
          firstHash = (firstHash << 6 & 268435455 ) + char + ( char <<14 );
          helper = firstHash & 266338304;
          firstHash = helper !==0 ? firstHash^helper >> 12 : firstHash;

      }
      //second hashing function, returns integer

      for (let i = 0; i < username.length; i++) {

        let char = username.charCodeAt(i);
        secondHash = ((secondHash << 5)- secondHash)+char;
        secondHash = secondHash & secondHash;

      }

      secondHash = Math.abs(secondHash)
    }
    //finds mod of both hashing functions, returns a style
    return {
      background: `linear-gradient(${(firstHash + secondHash) % 360}deg, ${avatarColors[firstHash % 8]},  ${avatarColors[secondHash % 8]}`,
    };
  },
}

export default CONFIG
