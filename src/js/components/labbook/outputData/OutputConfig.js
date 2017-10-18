import Moment from 'moment'

const Config = {
  files: [
          {
            key: 'output/',
            modified: + Moment().subtract(1, 'hours'),
            size: 0,
          }
        ]
}

export default Config
