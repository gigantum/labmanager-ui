import React, { Component } from 'react'
import {QueryRenderer, graphql} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

import ReactMarkdown from 'react-markdown'

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
    this.state = {
    }


  }
  /**
    @param {}
    after component mounts
  */
  componentDidMount() {

  }

  _renderDetail(item){
    switch(item[0]){
      case 'text/plain':
        return(<b>{item[1]}</b>)
      case 'img/png':
        return(<img src={item[1]} />)
      case 'img/jpg':
        return(<img src={item[1]} />)
      case 'img/jpeg':
        return(<img src={item[1]} />)
      case 'img/bpg':
        return(<img src={item[1]} />)
      case 'img/gif':
        return(<img src={item[1]} />)
      case 'text/markdown':
        return(<ReactMarkdown source={item[1]} />)
    }
  }


  render(){
    console.log(this.props.variables)
    return(
      <QueryRenderer
        environment={environment}
        query={DetailRecordsQuery}
        variables={this.props.variables}
        render={({props, error})=>{
      
            if(props){
                return(
                  <div className="DetailsRecords">
                    <ul className="DetailsRecords__list">
                    {
                      props.labbook.detailRecords.map((detailRecord)=>{
                        return(
                          detailRecord.data.map((item)=>{
                            return(
                              <li className="DetailsRecords__item">
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
                return(<div>Loading...</div>)
            }

        }}
      />
    )
  }
}
