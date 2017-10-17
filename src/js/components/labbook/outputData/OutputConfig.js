import Moment from 'moment'

const Config = {
  files: [
          {
            key: 'output/',
            modified: + Moment().subtract(1, 'hours'),
            size: 1.5 * 1024 * 1024,
          }
        ]
}

export default Config