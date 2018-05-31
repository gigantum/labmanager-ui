import React, { Component } from 'react';
import classNames from 'classnames';
//store
import store from "JS/redux/store"

let unsubscribe;

export default class Helper extends Component {
  constructor(props){
    super(props)
    this.state = store.getState().helper
    this._toggleIsVisible = this._toggleIsVisible.bind(this);
  }

  /**
    * @param {}
    * subscribe to store to update state
    * set unsubcribe for store
  */
  componentDidMount() {
    unsubscribe = store.subscribe(() =>{
        this.storeDidUpdate(store.getState().helper)
    })
  }
  storeDidUpdate(helper){
    let stateString = JSON.stringify(this.state)
    let storeString = JSON.stringify(helper)
    if(storeString !== stateString){
      this.setState(helper)
    }
  }
  componentWillUnmount(){
    unsubscribe();
  }

  _toggleIsVisible(){
    store.dispatch({
      type: 'UPDATE_HELPER_VISIBILITY',
      payload: {
        isVisible: !store.getState().helper.isVisible
      }
    })
  }

  render(){
    let menuCSS = classNames({
      'Helper__menu': this.state.isVisible,
      hidden: !this.state.isVisible
    })
    return(
      <div className="Helper">
        <div
          className="Helper-button"
          onClick={()=>this._toggleIsVisible()}
        >
        </div>
        <div className={menuCSS}>
          <div className="Helper__menu-docs">
            <button
              className="Helper__docs-button"
              onClick={()=> window.open('https://docs.gigantum.com/docs')}
            >
            </button>
            <h5>Documentation</h5>
          </div>
          <div className="Helper__menu-discussion">
            <button
              className="Helper__discussion-button"
              onClick={()=> window.open('https://docs.gigantum.com/discuss')}
            >
            </button>
            <h5>Discussion</h5>
          </div>
        </div>
      </div>
    )
  }
}