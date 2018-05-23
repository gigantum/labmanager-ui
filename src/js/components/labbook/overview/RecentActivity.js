//vendor
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
import Moment from 'moment'
//components
import CodeBlock from 'Components/labbook/renderers/CodeBlock'
//store
import store from 'JS/redux/store'


export default class RecentActivity extends Component {
  _renderDetail(node){
    let item = node.detailObjects[0].data[0] ? node.detailObjects[0].data[0] : ['text/markdown', node.message]
    if(item){
      switch(item[0]){
        case 'text/plain':
          return(<div className="ReactMarkdown"><p>{item[1]}</p></div>)
        case 'image/png':
          return(<p className="ReactMarkdown"><img alt="detail" src={item[1]} /></p>)
        case 'image/jpg':
          return(<p className="ReactMarkdown"><img alt="detail" src={item[1]} /></p>)
        case 'image/jpeg':
          return(<p className="ReactMarkdown"><img alt="detail" src={item[1]} /></p>)
        case 'image/bmp':
          return(<p className="ReactMarkdown"><img alt="detail" src={item[1]} /></p>)
        case 'image/gif':
          return(<p className="ReactMarkdown"><img alt="detail" src={item[1]} /></p>)
        case 'text/markdown':
          return(<ReactMarkdown renderers={{code: props => <CodeBlock  {...props }/>}} className="ReactMarkdown" source={item[1]} />)
        default:
          return(<b>{item[1]}</b>)
      }
    }else{
      return(<div>no result</div>)
    }
  }

  checkOverflow(el) {
    if(el) {
      var curOverflow = el.style.overflow;

      if ( !curOverflow || curOverflow === "visible" )
         el.style.overflow = "hidden";

      var isOverflowing = el.clientWidth < el.scrollWidth
         || el.clientHeight < el.scrollHeight;

      el.style.overflow = curOverflow;

      return isOverflowing;
    }
  }
  _setLinks() {
    let elements = Array.prototype.slice.call(document.getElementsByClassName('ReactMarkdown'));
    let moreObj = { 0: false, 1: false, 2: false }
    elements.forEach((elOuter, index) => {
      if (this.checkOverflow(elOuter) === true) moreObj[index] = true;
      elOuter.childNodes.forEach(elInner => {
        if (this.checkOverflow(elInner) === true) moreObj[index] = true;
      })
    });
    for (let key in this.refs) {
      if(!moreObj[key]) {
        ReactDOM.findDOMNode(this.refs[key]).className = 'hidden';
        ReactDOM.findDOMNode(this.refs[key]).previousSibling.classList.add('hidden')
      } else {
        ReactDOM.findDOMNode(this.refs[key]).className = 'RecentActivity__card-link';
        ReactDOM.findDOMNode(this.refs[key]).previousSibling.classList.remove('hidden')
      }
    }
  }

  componentDidMount() {
    this._setLinks();
    window.addEventListener("resize", this._setLinks.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._setLinks.bind(this));
  }

  _getDate(edge){

    let date = new Date(edge.timestamp)
    return Moment((date)).format('hh:mm a, MMMM Do, YYYY')
  }
  render(){
    if(this.props.recentActivity){
      const {owner, labbookName} = store.getState().routes
      const recentActivity = this.props.recentActivity.slice(0,3)
      return(
        <div className="RecentActivity">
          <div className="RecentActivity__title-container">
            <h5 className="RecentActivity__header">Activity</h5>
            <Link to={`../../../../labbooks/${owner}/${labbookName}/activity`}>Activity Details ></Link>
          </div>
          <div className="RecentActivity__list grid">
            {
              recentActivity.map((edge, index) =>{
                return (
                  <div
                    key={edge.id}
                    className="RecentActivity__card column-3-span-4">
                    <div className="RecentActivity__card-date">{this._getDate(edge)}</div>
                    <div className="RecentActivity__card-detail">
                      {
                        this._renderDetail(edge)
                      }
                    </div>
                    <div className="RecentActivity__fadeout hidden"></div>
                    <Link
                        className="RecentActivity__card-link hidden"
                        to={{pathname: `../../../../labbooks/${owner}/${labbookName}/activity`}}
                        replace
                        ref={index}
                    >
                        View More in Activity Feed >
                    </Link>
                  </div>
                )
              })
            }
          </div>
        </div>
      )
    }else{
      return(
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
