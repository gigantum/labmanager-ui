//vendor
import React, { Component } from 'react'

export default class Overview extends Component {

  _truncate(string, cutoff){
   if (string.length > cutoff)
      return string.substring(0,cutoff)+'...';
   else
      return string;
  };

  render(){
    console.log(this.props)
    let paths = this.props.edge.node.key.split('/')
    let name = paths[paths.length - 1]
    let truncatedName = this._truncate(name, 14)
    paths.pop()
    let path = paths.join('/')
    return(
      <div className="FileCard">
        <div classsName="FileCard__favorite"></div>
        <h6 title={name} className="FileCard__name">{truncatedName}</h6>
        <p className="FileCard__key">{path}</p>
        <p className="FileCard__description">{this.props.edge.node.description}</p>
      </div>
    )

  }
}
