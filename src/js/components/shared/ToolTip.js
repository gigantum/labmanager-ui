import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux'
//store
import store from 'JS/redux/store'
//config
import config from 'JS/config';

class ToolTip extends Component {
  constructor(props){
    super(props)
    const {isVisible} = store.getState().helper
    this.state = {
      toolTipExpanded: false,
      isVisible
    }
    this._hideToolTip = this._hideToolTip.bind(this);
  }


  static getDerivedStateFromProps(props, state){
    let toolTipExpanded = state.toolTipExpanded
    return {
      ...state,
      toolTipExpanded: props.isVisible ? toolTipExpanded : false
    }
  }

  /**
    * @param {}
    * subscribe to store to update state
  */
  componentDidMount() {
    window.addEventListener("click", this._hideToolTip)
  }
  /**
    @param {}
    unsubscribe from event listeners
  */
  componentWillUnmount(){
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
      'ToolTip': this.props.isVisible,
      'hidden': !this.props.isVisible,
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

const mapStateToProps = (state, ownProps) => {
  return {
    isVisible: state.helper.isVisible
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ToolTip);
