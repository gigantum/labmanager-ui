//vendor
import fs from 'fs'
import os from 'os'
//mutations
import StartDevToolMutation from 'Mutations/container/StartDevToolMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const StartDevTool = {
  startDevTool: (labbbookName, callback) => {
    const {
      devTool
    } = testConfig;
    StartDevToolMutation(
      owner,
      labbbookName,
      devTool,
      callback
    )
  }
}

export default StartDevTool;
