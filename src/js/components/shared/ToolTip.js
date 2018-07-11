import React, { Component } from 'react';
import classNames from 'classnames';
//store
import store from 'JS/redux/store'
//config
import config from 'JS/config';

export default class ToolTip extends Component {
  constructor(props){
    super(props)
    const {isVisible} = store.getState().helper
    this.state = {
      toolTipExpanded: false,
      isVisible
    }
    this._hideToolTip = this._hideToolTip.bind(this);
  }

  /**
    * @param {}
    * subscribe to store to update state
    * set unsubcribe for store
  */
  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>{
        this.storeDidUpdate(store.getState().helper)
    })
    window.addEventListener("click", this._hideToolTip)
  }
  /**
    * @param {object} helper
    * will update component state based on redux state
  */
  storeDidUpdate(helper){
    const {isVisible} = helper;
    if(isVisible !== this.state.isVisible){
      let toolTipExpanded = this.state.toolTipCSS
      this.setState({isVisible, toolTipExpanded: isVisible ? toolTipExpanded : false})
    }
  }
  /**
    @param {}
    unsubscribe from redux store
  */
  componentWillUnmount(){
    this.unsubscribe();
    window.removeEventListener("click", this._hideToolTip)
  }
  /**
   *  @param {event} evt
   *  closes tooltip box when tooltip is open and the tooltip has not been clicked on
   *
  */
  _hideToolTip(evt){
    if(this.state.toolTipExpanded && evt.target.className.indexOf(this.props.section) === -1){
      this.setState({toolTipExpanded: false})
    }
  }

  render(){
    const {section} = this.props;
    let toolTipCSS = classNames({
      'ToolTip': this.state.isVisible,
      'hidden': !this.state.isVisible,
      [section]: true,
      'isSticky': store.getState().labbook.isSticky
    })
    let toggleCSS = classNames({
      'ToolTip__toggle': true,
      [section]: true,
      'active': this.state.toolTipExpanded
    })
    let messsageCSS = classNames({
      'ToolTip__message': this.state.toolTipExpanded,
      'hidden': !this.state.toolTipExpanded,
      [section]: true,
    })
    let pointerCSS = classNames({
      'ToolTip__pointer': this.state.toolTipExpanded,
      'hidden': !this.state.toolTipExpanded,
      [section]: true,
    })
    return(
      <div className={toolTipCSS}>

        <div
          className={toggleCSS}
          onClick={()=> this.setState({toolTipExpanded: !this.state.toolTipExpanded})}
        >
          {
            !this.state.toolTipExpanded &&
            <div className="ToolTip__glow-container">
              <div className="ToolTip__glow-ring-outer">
                <div className="ToolTip__glow-ring-inner"></div>
              </div>
            </div>
          }
        </div>


        <div className={pointerCSS}>
        </div>
        <div className={messsageCSS}>
          {config.getToolTipText(section)}
        </div>

      </div>
    )
  }
}
