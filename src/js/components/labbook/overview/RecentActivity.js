//vendor
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
import Moment from 'moment'
//components
import CodeBlock from 'Components/labbook/renderers/CodeBlock'
import ToolTip from 'Components/shared/ToolTip';
//store
import store from 'JS/redux/store'

export default class RecentActivity extends Component {

  componentDidMount() {
    this._setLinks();
    window.addEventListener("resize", this._setLinks.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._setLinks.bind(this));
  }

  /***
    @param {object} elenodement
    return markdown
    @return {jsx}
  */
  _renderDetail(node) {

    let item = node.detailObjects[0].data[0]
      ? node.detailObjects[0].data[0]
      : ['text/markdown', node.message]
    if (item) {
      //TODO: remove switch and use if else to match an image vs text
      switch (item[0]) {
        case 'text/plain':
          return (<div className="ReactMarkdown">
            <p>{item[1]}</p>
          </div>)
        case 'image/png':
          return (<p className="ReactMarkdown"><img alt="detail" src={item[1]}/></p>)
        case 'image/jpg':
          return (<p className="ReactMarkdown"><img alt="detail" src={item[1]}/></p>)
        case 'image/jpeg':
          return (<p className="ReactMarkdown"><img alt="detail" src={item[1]}/></p>)
        case 'image/bmp':
          return (<p className="ReactMarkdown"><img alt="detail" src={item[1]}/></p>)
        case 'image/gif':
          return (<p className="ReactMarkdown"><img alt="detail" src={item[1]}/></p>)
        case 'text/markdown':
          return (<ReactMarkdown renderers={{
              code: props => <CodeBlock {...props }/>
            }} className="ReactMarkdown" source={item[1]}/>)
        default:
          return (<b>{item[1]}</b>)
      }
    } else {
      return (<div>no result</div>)
    }
  }
  /***
    @param {object} element
    checks if element is too large for card area
    @return {boolean}
  */
  _checkOverflow(element) {
    if (element) {
      var curOverflow = element.style.overflow;

      if (!curOverflow || curOverflow === "visible")
        element.style.overflow = "hidden";

      var isOverflowing = element.clientWidth < element.scrollWidth || element.clientHeight < element.scrollHeight;

      element.style.overflow = curOverflow;

      return isOverflowing;
    }
  }

  /***
    @param {}
    sets
  */
  _setLinks() {
    //TODO rewrite this or add comments
    let elements = Array.prototype.slice.call(document.getElementsByClassName('ReactMarkdown'));
    let moreObj = {
      0: false,
      1: false,
      2: false
    }

    elements.forEach((elOuter, index) => {

      if (this._checkOverflow(elOuter) === true)
        moreObj[index] = true;

      elOuter.childNodes.forEach(elInner => {
        if (this._checkOverflow(elInner) === true)
          moreObj[index] = true;
        }
      )
    });

    for (let key in this.refs) {

      if (!moreObj[key]) {

        ReactDOM.findDOMNode(this.refs[key]).className = 'hidden';

        if( ReactDOM.findDOMNode(this.refs[key]).previousSibling){
          ReactDOM.findDOMNode(this.refs[key]).previousSibling.classList.add('hidden')
        }

      } else {

        ReactDOM.findDOMNode(this.refs[key]).className = 'RecentActivity__card-link';

        if( ReactDOM.findDOMNode(this.refs[key]).previousSibling){
          ReactDOM.findDOMNode(this.refs[key]).previousSibling.classList.remove('hidden')
        }

      }
    }
  }
  /*
    @param {object}
    returns formated date
    @return {string}
  */
  _getDate(edge) {

    let date = new Date(edge.timestamp)
    return Moment((date)).format('hh:mm a, MMMM Do, YYYY')
  }

  render() {
    if (this.props.recentActivity) {
      const {owner, labbookName} = store.getState().routes
      const recentActivity = this.props.recentActivity.slice(0, 3)

      return (<div className="RecentActivity">
        <div className="RecentActivity__title-container">

          <h5 className="RecentActivity__header">
            Activity
            <ToolTip section="recentActivity"/>
          </h5>

          <Link
            onClick={this.props.scrollToTop}
            to={`../../../../projects/${owner}/${labbookName}/activity`}
          >
            Activity Details >
          </Link>

        </div>

        <div className="RecentActivity__list grid">
          {
            recentActivity.map((edge, index) => {
              return (<div key={edge.id} className="RecentActivity__card column-3-span-4">
                <div className="RecentActivity__card-date">{this._getDate(edge)}</div>
                <div className="RecentActivity__card-detail">
                  {this._renderDetail(edge)}
                </div>
                <div className="RecentActivity__fadeout hidden"></div>
                <Link className="RecentActivity__card-link hidden" to={{
                    pathname: `../../../../projects/${owner}/${labbookName}/activity`
                  }} replace={true}
                  ref={index}
                  onClick={this.props.scrollToTop}
                  >
                  View More in Activity Feed >
                </Link>
              </div>
              )
              })
            }
        </div>
      </div>
      ) }else{

        return (
          <div className="RecentActivity">
            <h5 className="RecentActivity__header">Activity</h5>
            <div className="RecentActivity__list grid">
              <div className="RecentActivity__card--loading"></div>
              <div className="RecentActivity__card--loading"></div>
              <div className="RecentActivity__card--loading"></div>
            </div>
         </div>)
      }
   }
}
