import Moment from 'moment'
console.log(Moment)
const Config = {
  files: [
          {
            key: 'photos/animals/cat in a hat.png',
            modified: + Moment().subtract(1, 'hours'),
            size: 1.5 * 1024 * 1024,
          },
          {
            key: 'photos/animals/kitten_ball.png',
            modified: + Moment().subtract(3, 'days'),
            size: 545 * 1024,
          },
          {
            key: 'photos/animals/elephants.png',
            modified: + Moment().subtract(3, 'days'),
            size: 52 * 1024,
          },
          {
            key: 'photos/funny fall.gif',
            modified: + Moment().subtract(2, 'months'),
            size: 13.2 * 1024 * 1024,
          },
          {
            key: 'photos/holiday.jpg',
            modified: + Moment().subtract(25, 'days'),
            size: 85 * 1024,
          },
          {
            key: 'documents/letter chunks.doc',
            modified: + Moment().subtract(15, 'days'),
            size: 480 * 1024,
          },
          {
            key: 'documents/export.pdf',
            modified: + Moment().subtract(15, 'days'),
            size: 4.2 * 1024 * 1024,
          },
        ]
}

export default Config
