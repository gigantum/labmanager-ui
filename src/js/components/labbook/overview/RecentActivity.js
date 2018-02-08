//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import ReactMarkdown from 'react-markdown'
import Moment from 'moment'
//components
import Loader from 'Components/shared/Loader'
import FileCard from './FileCard'
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
  _renderDetail(item){

    switch(item[0]){
      case 'text/plain':
        return(<b>{item[1]}</b>)
      case 'image/png':
        return(<img src={item[1]} />)
      case 'image/jpg':
        return(<img src={item[1]} />)
      case 'image/jpeg':
        return(<img src={item[1]} />)
      case 'image/bmp':
        return(<img src={item[1]} />)
      case 'image/gif':
        return(<img src={item[1]} />)
      case 'text/markdown':
        return(<ReactMarkdown source={item[1]} />)
      default:
        return(<b>{item[1]}</b>)
    }
  }

  _getDate(edge){

    let date = new Date(edge.node.timestamp)
    return Moment((date)).format('hh:mm a, MMMM Do, YYYY')
  }
  render(){
    const {owner, labbookName} = store.getState().routes
    return(
    <QueryRenderer
      variables={{
        name: labbookName,
        owner: owner,
        first: 3
      }}
      query={RecentActivityQuery}
      environment={environment}
      render={({error, props}) =>{
        if(props){

          return(
            <div className="RecentActivity">
              <h5 className="RecentActivity__header">Activity</h5>
              <div className="RecentActivity__list">
                {
                  props.labbook.activityRecords.edges.map(edge =>{
                    return (
                      <div className="RecentActivity__card">
                        <div>{this._getDate(edge)}</div>
                        <div className="RecentActivity__card-detail">
                          {this._renderDetail(edge.node.detailObjects[0].data[0])}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )
        }else if(error){

          return(<div>{error.message}</div>)
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
      }}

    />)
  }
}
