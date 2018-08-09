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
    this._resize = this._resize.bind(this)


  }

  /**
    * @param {}
    * subscribe to store to update state
    * set unsubcribe for store
  */
  componentDidMount() {
    unsubscribe = store.subscribe(() =>{
        this.storeDidUpdate(store.getState().helper, store.getState().footer)
    })

    window.addEventListener("resize", this._resize);
  }
  /**
    * @param {}
    * updates state from redux store
  */
  storeDidUpdate(helper, footer){

    const helperString = JSON.stringify(helper)
    const stateString = JSON.stringify(this.state)

    if((stateString !== helperString) || (this.state.uploadOpen !== footer.uploadOpen)){
      this.setState({
        resize: helper.resize,
        isVisible: helper.helperMenuOpen,
        footerVisible: helper.footerVisible,
        uploadOpen: footer.uploadOpen
      })
    }
  }
  /**
    * @param {}
    * unsubcribe from store
  */
  componentWillUnmount(){
    unsubscribe();
  }

  /**
    * @param {}
    * update store
  */
  _toggleIsVisible(){
    store.dispatch({
      type: 'UPDATE_HELPER_VISIBILITY',
      payload: {
        isVisible: !store.getState().helper.isVisible
      }
    })

    store.dispatch({
      type: 'HELPER_VISIBLE',
      payload:{
        helperVisible: !store.getState().helper.isVisible
      }
    })
  }
  /**
    * @param {}
    * toggles menu view
  */
  _toggleMenuView(){
    store.dispatch({
      type: 'HELPER_VISIBLE',
      payload:{
        helperVisible: !this.state.helperMenuOpen
      }
    })

    this.setState({helperMenuOpen: !this.state.helperMenuOpen})


  }

  /**
    * @param {}
    * update store to risize component
  */
  _resize(){
    store.dispatch({
      type: 'RESIZE_HELPER',
      payload: {}
    })
  }

  render(){
    let bodyWidth = document.body.clientWidth;

    let menuCSS = classNames({
      'Helper__menu': this.state.helperMenuOpen,
      'hidden': !this.state.helperMenuOpen,
      'Helper__men--footer-open': this.state.footerVisible
    })

    let helperButtonCSS = classNames({
      'Helper__button': true,
      'Helper__button--open': this.state.helperMenuOpen,
      'Helper__button--side-view': bodyWidth < 1600,
      'Helper__button--bottom': this.state.uploadOpen && !this.state.helperMenuOpen
    })

    return(
      <div className="Helper">
        <div
          className={helperButtonCSS}
          onClick={()=> this._toggleMenuView()}
        >
        </div>
        <div className={menuCSS}>
          <div
            className="Helper__menu-feedback"
            onClick={()=> window.open('https://app.craft.io/share/C3174F4B2305843009657781316')}
          >
            <h5>Feedback</h5>
            <div
              className="Helper__feedback-button"
            >
            </div>
          </div>
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
            onClick={() => window.open('https://docs.gigantum.com/docs')}
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
