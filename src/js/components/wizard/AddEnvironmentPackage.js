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
    console.log(this.state)
  }


  /*
    function()
    gets current selectedBaseImage and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
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

    console.log(all)
    Promise.all(all).then(values => {
      console.log(values)
      this.props.setComponent(this.props.nextWindow)
    }, reason => {
      console.log(reason)
    })

  }

  _setCurrentPackageManager(e, index){
    console.log(e, index)
    let newEnvironmentPackages = this.state.environmentPackages;
    newEnvironmentPackages[index]['packageManager'] = e.target.value;
    this.setState({'environmentPackages': newEnvironmentPackages})
  }

  _updateDependencyName(e, index){
    console.log(e, e.target.value, index)
    let newEnvironmentPackages = this.state.environmentPackages;
    newEnvironmentPackages[index]['dependencyName'] = e.target.value;
    this.setState({'environmentPackages': newEnvironmentPackages})
  }

  _addRemovePackage(e, packSate, index){
      console.log(e, packSate, index)
      let newEnvironmentPackages = this.state.environmentPackages;
      if(packSate === 'Add'){
        newEnvironmentPackages[index]['state'] = 'Remove';
        newEnvironmentPackages.push({state: 'Add', 'packageManager': this.props.baseImage.node.availablePackageManagers[0], dependencyName: null})
      }else{
        newEnvironmentPackages.splice(index, 1)
      }
      console.log(newEnvironmentPackages)
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
