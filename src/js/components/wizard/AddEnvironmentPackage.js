import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
import AddEnvironmentPackageMutation from './../../mutations/AddEnvironmentPackageMutation'


export default class AddEnvironmentPackage extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
      'environmentPackages': [
        {state: 'Add', 'packageManager': this.props.baseImage.node.availablePackageManagers[0], dependencyName: null}
      ]
    };
  }


  /*
    function()
    installs environents pacakges
    gets environment package state and loops through packages
    pushes mutations into a promise and resolves if succesful
    if all promises resolve, setComponent is triggered and next component is loaded
  */
  _installEnvironementPackage(){
    let all = [];

    this.state.environmentPackages.map((pack) => {

      if(pack.dependencyName !== null){
        let promise = new Promise((resolve, reject) => {
          AddEnvironmentPackageMutation(
            this.props.labbookName,
            'default',
            pack.packageManager,
            pack.dependencyName,
            "clientMutationId",
            (log, error) => {
              console.log(log, error)
              resolve()

            }
          )

        })

        all.push(promise)
      }
    })


    Promise.all(all).then(values => {
      this.props.setComponent(this.props.nextWindow)
    }, reason => {
      console.error(reason)
    })

  }

  _setCurrentPackageManager(e, index){

    let newEnvironmentPackages = this.state.environmentPackages;
    newEnvironmentPackages[index]['packageManager'] = e.target.value;
    this.setState({'environmentPackages': newEnvironmentPackages})
  }

  _updateDependencyName(e, index){

    let newEnvironmentPackages = this.state.environmentPackages;
    newEnvironmentPackages[index]['dependencyName'] = e.target.value;
    this.setState({'environmentPackages': newEnvironmentPackages})
  }

  _addRemovePackage(e, packSate, index){
      let newEnvironmentPackages = this.state.environmentPackages;
      if(packSate === 'Add'){
        newEnvironmentPackages[index]['state'] = 'Remove';
        newEnvironmentPackages.push({state: 'Add', 'packageManager': this.props.baseImage.node.availablePackageManagers[0], dependencyName: null})
      }else{
        newEnvironmentPackages.splice(index, 1)
      }

      this.setState({'environmentPackages': newEnvironmentPackages})

  }

  render(){

    return(
      <div className="AddEnvironmentPackage">

          <p>Install dependencies via Package Manager</p>


          {
            this.state.environmentPackages.map((pack, index) => {
              return(
                <div className="AddEnvironmentPackage__row flex flex--row justify--space-between">
                  <div className="AddEnvironmentPackage__select--container">
                    <select disabled={pack.state === 'Remove'} className="AddEnvironmentPackage__select" onChange={(e) => this._setCurrentPackageManager(e, index)}>
                      {
                        this.props.baseImage.node.availablePackageManagers.map((pm) => {
                          return(<option key={pm} value={pm}>{pm}</option>)
                        })
                      }
                    </select>
                  </div>
                  <input disabled={pack.state === 'Remove'} onChange={(e) => this._updateDependencyName(e, index)} type="text" placeholder="Dependency Name"></input>
                  <button disabled={(pack.dependencyName === null) || (pack.packageManager === null) } onClick={(e) =>this._addRemovePackage(e, pack.state, index)}>{pack.state}</button>
                </div>
            )
            })
          }


          <button onClick={() => this._installEnvironementPackage()}> Save and Continue Setup </button>

      </div>
      )
  }
}
