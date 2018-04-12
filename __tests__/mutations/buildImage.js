//vendor
import fs from 'fs'
import os from 'os'
//mutations
import BuildImageMutation from 'Mutations/BuildImageMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const BuildImage = {
    buildImage: (labbbookName, noCache, callback) => {
      BuildImageMutation(
      labbbookName,
      owner,
      noCache,
      callback
    )
  }
}

export default BuildImage;
