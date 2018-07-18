import React, { Component } from 'react';
import classNames from 'classnames';
//store
import store from "JS/redux/store"

let unsubscribe;

export default class Helper extends Component {
  constructor(props){
    super(props)
    this.state = store.getState().helper
    this.state.helperMenuOpen = false;
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
    if(this.state.isVisible !== helper.isVisible){
      this.setState({isVisible: helper.isVisible})
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
      'Helper__menu': this.state.helperMenuOpen,
      'hidden': !this.state.helperMenuOpen
    })
    let helperButtonCSS = classNames({
      'Helper-button': true,
      'Helper-button--open': this.state.helperMenuOpen
    })
    return(
      <div className="Helper">
        <div
          className={helperButtonCSS}
          onClick={()=> this.setState({helperMenuOpen: !this.state.helperMenuOpen})}
        >
        </div>
        <div className={menuCSS}>
          <div
            className="Helper__menu-discussion"
            onClick={()=> window.open('https://docs.gigantum.com/discuss')}
          >
            <h5>Discuss</h5>
            <div
              className="Helper__discussion-button"
            >
            </div>
          </div>
          <div
            className="Helper__menu-docs"
            onClick={()=> window.open('https://docs.gigantum.com/docs')}
          >
            <h5>Docs</h5>
            <div
              className="Helper__docs-button"
            >
            </div>
          </div>
          <div
            className="Helper__menu-guide"
          >
            <h5>Guide</h5>
            <label className="Helper-guide-switch">
              <input type="checkbox"
                onClick={()=>this._toggleIsVisible()}
              />
              <span className="Helper-guide-slider"></span>
            </label>
          </div>
        </div>
      </div>
    )
  }
}
