//vendor
import React, { Component } from 'react'
import {QueryRenderer, graphql} from 'react-relay'
import ReactMarkdown from 'react-markdown'
//environment
import environment from 'JS/createRelayEnvironment'
//store
import store from 'JS/redux/store'

let DetailRecordsQuery = graphql`
query DetailRecordsQuery($name: String!, $owner: String!, $keys: [String]){
  labbook(name: $name, owner: $owner){
    id
    description
    detailRecords(keys: $keys){
      id
      key
      data
      type
      show
      importance
      tags
    }
  }
}`


export default class UserNote extends Component {
  constructor(props){
  	super(props);

    const {owner, labbookName} = store.getState().routes

    this.state = {
      owner: owner,
      labbookName: labbookName
    }
  }

  _renderDetail(item){
    switch(item[0]){
      case 'text/plain':
        return(<b>{item[1]}</b>)
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
        return(<ReactMarkdown source={item[1]} />)
      default:
        return(<b>{item[1]}</b>)
    }
  }


  render(){
    let variables ={
      keys: this.props.keys,
      owner: this.state.owner,
      name: this.state.labbookName
    }
    return(
      <QueryRenderer
        environment={environment}
        query={DetailRecordsQuery}
        variables={variables}
        render={({props, error})=>{

            if(props){

                return(
                  <div className="DetailsRecords">
                    <ul className="DetailsRecords__list">
                    {
                      props.labbook.detailRecords.map((detailRecord)=>{

                        return(
                          detailRecord.data.map((item, index)=>{

                            return(
                              <li
                                key={detailRecord.id + '_'+ index}
                                className="DetailsRecords__item">
                                {this._renderDetail(item)}
                            </li>)
                          })
                        )
                      })
                    }
                    </ul>
                  </div>
                )
            }else{
                return(
                  <div className="DetailsRecords__loader-group">
                    <div className="DetailsRecords__loader"></div>
                    <div className="DetailsRecords__loader"></div>
                    <div className="DetailsRecords__loader"></div>
                  </div>
                )
            }

        }}
      />
    )
  }
}
