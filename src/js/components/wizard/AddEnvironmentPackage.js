//vendor
import React from 'react'
import SweetAlert from 'sweetalert-react';
//mutations
import AddEnvironmentPackageMutation from 'Mutations/AddEnvironmentPackageMutation'


let addEnvionmentPackage;
export default class AddEnvironmentPackage extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
      'environmentPackages': [
        {state: 'Add', 'packageManager': this.props.availablePackageManagers[0], dependencyName: null}
      ],
      'show': false,
      'message': ''
    };
    addEnvionmentPackage = this;

    this.props.toggleDisabledContinue(false);
    this.continueSave = this.continueSave.bind(this);
  }

  _environmentView(){
    return this.props.environmentView
  }

  /*
    function()
    installs environents pacakges
    gets environment package state and loops through packages
    pushes mutations into a promise and resolves if succesful
    if all promises resolve, setComponent is triggered and next component is loaded
  */
  continueSave(){
    let all = [];
    this.props.setComponent(this.props.nextWindow)

    this.state.environmentPackages.forEach((pack) => {
      if(pack.dependencyName){
        let promise = new Promise((resolve, reject) => {

          AddEnvironmentPackageMutation(
            this.props.labbookName,
            'default',
            pack.packageManager,
            pack.dependencyName,
            this.props.environmentId,
            (error) => {
              console.log(error)
              let showAlert = ((error !== null) && (error !== undefined))
              let message = showAlert ? error[0].message : '';
              addEnvionmentPackage.setState({
                'show': showAlert,
                'message': message,

              })
              if(!showAlert){
                resolve()
              }else{
                addEnvionmentPackage.setState({
                  'reject': reject
                })
              }

            }
          )
        })

        all.push(promise)
      }
    })


    Promise.all(all).then(values => {

      if(this.props.environmentView){

        addEnvionmentPackage.props.buildCallback();
      }else{
          this.props.setComponent(this.props.nextWindow)
      }

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
    if(e.key !== 'Enter'){
      let newEnvironmentPackages = this.state.environmentPackages;
      newEnvironmentPackages[index]['dependencyName'] = e.target.value;

      this.setState({'environmentPackages': newEnvironmentPackages})
    }else{
      this._addRemovePackage(e, 'Add', index);
    }
  }

  _addRemovePackage(e, packSate, index){
      let newEnvironmentPackages = this.state.environmentPackages;
      if(packSate === 'Add'){
        newEnvironmentPackages[index]['state'] = 'Remove';
        newEnvironmentPackages.push({state: 'Add', 'packageManager': this.props.availablePackageManagers[0], dependencyName: null})
      }else{
        newEnvironmentPackages.splice(index, 1)
      }

      this.setState({'environmentPackages': newEnvironmentPackages})

  }

  render(){

    return(
      <div className="AddEnvironmentPackage">
          <div className="AddEnvironmentPackage__inner-container">
            <p>Install dependencies via Package Manager</p>


            {
              this.state.environmentPackages.map((pack, index) => {
                return(
                  <div key={index} className="AddEnvironmentPackage__row flex flex--row justify--space-between">
                    <div className="AddEnvironmentPackage__select--container">
                      <select
                        disabled={pack.state === 'Remove'}
                        key={index + '_select'}
                        className="AddEnvironmentPackage__select"
                        onChange={(e) => this._setCurrentPackageManager(e, index)}>
                        {
                          this.props.availablePackageManagers.map((pm) => {
                            return(<option
                              className="AddEnvironmentPackage__select"
                              key={pm}
                              value={pm}>
                                {pm}
                              </option>
                            )
                          })
                        }
                      </select>
                    </div>
                    <input
                      className="AddEnvironmentPackage__text-input"
                      ref={'packgeInput' + index }
                      disabled={pack.state === 'Remove'}
                      onKeyUp={(e) => this._updateDependencyName(e, index)}
                      type="text"
                      placeholder="Dependency Name"
                      autoFocus={((this.state.environmentPackages.length-1) === index)}
                      >

                    </input>
                    <button
                      className="AddEnvironmentPackage__button"
                      disabled={(pack.dependencyName === null) || (pack.packageManager === null) }
                      onClick={(e) =>this._addRemovePackage(e, pack.state, index)}>
                      {pack.state}
                    </button>
                  </div>
              )
              })
            }
            <SweetAlert
              className="sa-error-container"
              show={this.state.show}
              type="error"
              title="Error"
              text={this.state.message}
              onConfirm={() => {this.state.reject(); this.setState({ show: false, message: ''})}} />

          </div>
          {
            this._environmentView() && (<div className="AddEnvironmentPackage__progress-buttons flex flex--row justify--space-between">

            <button onClick={() => this.continueSave()}>Save</button>
          </div>)
        }

      </div>
      )
  }
}
