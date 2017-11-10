import Moment from 'moment'

const Config = {
  files: [
          {
            key: 'input/',
            modified: + Moment().subtract(1, 'hours'),
            size: 0,
          }
        ]
}

export default Config
