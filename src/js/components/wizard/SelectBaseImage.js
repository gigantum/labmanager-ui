//vendor
import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
//utilites
import environment from 'JS/createRelayEnvironment'




const BaseImageQuery = graphql`query SelectBaseImageQuery($first: Int!, $cursor: String){
  availableBases(first: $first, after: $cursor)@connection(key: "SelectBaseImage_availableBases"){
    edges{
      node{
        id
        schema
        repository
        componentId
        revision
        name
        description
        readme
        tags
        icon
        osClass
        osRelease
        license
        url
        languages
        developmentTools
        packageManagers
        dockerImageServer
        dockerImageNamespace
        dockerImageRepository
        dockerImageTag
      }
      cursor
    }
    pageInfo{
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}`

export default class SelectBaseImage extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'name': '',
      'description': '',
      'selectedBaseImage': null,
      'selectedBaseImageId': false,
    };
  }
  /**
    @param {object} edge
    takes a base image edge
    sets componest state for selectedBaseImageId and selectedBaseImage
  */
  _selectBaseImage(edge){
    this.setState({'selectedBaseImage': edge})
    this.setState({'selectedBaseImageId': edge.node.id})
    this.props.toggleDisabledContinue(false);
    this.continueSave = this.continueSave.bind(this);
  }
  /**
    @param {}
    gets current selectedBaseImage and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  continueSave(){
    const username = localStorage.getItem('username')
    let component = this.state.selectedBaseImage.node.component;
    this.props.toggleDisabledContinue(true);

  }
  /**
    @param {}
    @return {Object} environmentView
  */
  _environmentView(){
    return this.props.environmentView
  }

  render(){

    return(
      <div className="SelectBaseImage">

        <p> Base Image </p>

        <QueryRenderer
          variables={{
            first: 20
          }}
          query={BaseImageQuery}
          environment={environment}
          render={({error, props}) =>{

              if(error){

                return(<div>{error.message}</div>)
              }else{

                if(props){
                  return(
                    <div className="SelectBaseImage__inner-container flex flex--column justify--space-between">
                      <div className="SelectBaseImage__selected-image-container">

                          {
                            (this.state.selectedBaseImage !== null) && (
                              <div
                                className="SelectBaseImage__selected-image">
                                <img
                                  alt=""
                                  src={this.state.selectedBaseImage.node.info.icon}
                                  height="50"
                                  width="50"
                                />
                                <p>{this.state.selectedBaseImage.node.info.humanName}</p>
                              </div>
                            )
                          }
                      </div>

                      <div className="SelectBaseImage__images flex flex--row flex--wrap justify--space-around">
                      {
                        props.availableBaseImages.edges.map((edge) => {

                            return(
                              <div
                                className={(this.state.selectedBaseImageId === edge.node.id) ? 'SelectBaseImage__image--selected': 'SelectBaseImage__image'}
                                onClick={()=> this._selectBaseImage(edge)}
                                key={edge.node.id}>
                                  <img
                                    alt=""
                                    src={edge.node.info.icon}
                                    height="50"
                                    width="50"
                                  />
                                  <p>{edge.node.info.humanName}</p>
                              </div>
                            )
                        })
                      }

                    </div>

                    {
                      this._environmentView() && (
                        <div className="SelectBaseImage__progress-buttons flex flex--row justify--space-between">
                          <button onClick={() => this.continueSave()}>Save</button>
                        </div>
                      )
                      }

                  </div>
                )
                }else{
                  return(<Loader />)
                }
              }
          }}
        />

      </div>
      )
  }
}
