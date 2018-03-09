//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import {Link} from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
import Moment from 'moment'
//components
import CodeBlock from 'Components/labbook/renderers/CodeBlock'
//utilites
import environment from 'JS/createRelayEnvironment'
//store
import store from 'JS/redux/store'

let RecentActivityQuery = graphql`query RecentActivityQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    activityRecords(first: $first){
      edges{
        node{
          id
          message
          detailObjects{
            data
            type
          }
          timestamp
        }
      }
    }
  }
}
`

export default class RecentActivity extends Component {
  _renderDetail(node){
    let item = node.detailObjects[0].data[0] ? node.detailObjects[0].data[0] : ['text/markdown', node.message]
    if(item){
      switch(item[0]){
        case 'text/plain':
          return(<ReactMarkdown renderers={{code: props => <CodeBlock  {...props }/>}} className="ReactMarkdown" source={item[1]} />)
        case 'image/png':
          return(<img alt="detail" src={item[1]} />)
        case 'image/jpg':
          return(<img alt="detail" src={item[1]} />)
        case 'image/jpeg':
          return(<img alt="detail" src={item[1]} />)
        case 'image/bmp':
          return(<img alt="detail" src={item[1]} />)
        case 'image/gif':
          return(<img alt="detail" src={item[1]} />)
        case 'text/markdown':
          return(<ReactMarkdown renderers={{code: props => <CodeBlock  {...props }/>}} className="ReactMarkdown" source={item[1]} />)
        default:
          return(<b>{item[1]}</b>)
      }
    }else{
      return(<div>no result</div>)
    }
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
          <div className="RecentActivity__list">
            {
              recentActivity.map(edge =>{
                return (
                  <div
                    key={edge.id}
                    className="RecentActivity__card">
                    <div>{this._getDate(edge)}</div>
                    <div className="RecentActivity__card-detail">
                      {
                        this._renderDetail(edge)
                      }
                    </div>
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
        <div className="RecentActivity__list">
          <div className="RecentActivity__card--loading"></div>
          <div className="RecentActivity__card--loading"></div>
          <div className="RecentActivity__card--loading"></div>
        </div>
      </div>)
    }
  }
}
