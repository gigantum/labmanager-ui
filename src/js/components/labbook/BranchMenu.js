import React, { Component } from 'react'
import SimpleMDE from 'simplemde'
import { WithContext as ReactTags } from 'react-tag-input';

import AddLabbookRemoteMutation from 'Mutations/branches/AddLabbookRemoteMutation'
import PushActiveBranchToRemoteMutation from 'Mutations/branches/PushActiveBranchToRemoteMutation'

let simple;

export default class UserNote extends Component {
  constructor(props){
  	super(props);
    this.state = {
      'addNoteEnabled': false,
      'remoteURL': '',
    }

    this._openMenu = this._openMenu.bind(this)

  }
  /**
  *  @param {}
  *  toggles open menu state
  *  @return {string}
  */
  _openMenu(){
    this.setState({menuOpen: !this.state.menuOpen})
  }

  /**
  *  @param {event} evt
  *  toggles open menu state
  *  @return {string}
  */
  _updateRemote(evt){
    this.setState({
      remoteURL: evt.target.value
    })
  }

  _addRemote(){
    //ssh://git@ec2-107-22-88-175.compute-1.amazonaws.com:9922/root/test-ui.git
    let remote = 'ssh://' + this.state.remoteURL.replace('com:root', 'com:9922/root')
    let self = this;
    if(this.state.remoteURL.length > -1){
      AddLabbookRemoteMutation(
        localStorage.getItem('username'),
        this.props.labbookName,
        'origin',
        remote,
        this.props.labbookId,
        (error)=>{
          if(error){
            console.log(error)

          }else{
            PushActiveBranchToRemoteMutation(
              localStorage.getItem('username'),
              self.props.labbookName,
              'origin',
              self.props.labbookId,
              (error)=>{
                if(error){
                  console.log(error)
                }
              }
            )
          }
        }
      )
    }

    this.setState({
      'remoteURL': ''
    })
  }
  _pushToRemote(){
    PushActiveBranchToRemoteMutation(
      localStorage.getItem('username'),
      this.props.labbookName,
      'origin',
      this.props.labbookId,
      (error)=>{
        if(error){
          console.log(error)
        }
      }
    )
  }
  render(){
    const {tags} = this.state;
    console.log(this.props)
    return(
      <div className="BranchMenu flex flex--column">
          <button onClick={()=>{this._openMenu()}} className="BranchMenu__button"></button>
          <div className={this.state.menuOpen ? 'BranchMenu__menu' : 'BranchMenu__menu hidden'}>
            <ul>
              <li>New Branch</li>
              <li>Merge</li>
              <li>Dead-end</li>
              <li>Favorite</li>
            </ul>
            <hr />
            {/* <button>Publish</button> */}
            { (this.props.defaultRemote === null) &&
              <div className="BranchMenu__add-remote-container">
                <input
                  type="text"
                  placeholder="Paste remote address here"
                  onKeyUp={(evt)=>{this._updateRemote(evt)}}
                  onChange={(evt)=>{this._updateRemote(evt)}}
                />

                <button
                  disabled={(this.state.remoteURL.length === 0)}
                  onClick={() => this._addRemote()}
                  >
                  Add Remote
                </button>
              </div>
            }

            { (this.props.defaultRemote !== null) &&
              <div className="BranchMenu__push">
                <button
                  onClick={() => this._pushToRemote()}
                  >
                  Push To Remote
                </button>
              </div>
            }
          </div>
      </div>
    )
  }
}
