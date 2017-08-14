import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
import AddEnvironmentComponentMutation from './../../mutations/AddEnvironmentComponentMutation'

const BaseImageQuery = graphql`query SelectBaseImageQuery($first: Int!, $cursor: String){
  availableBaseImages(first: $first, after: $cursor){
    edges{
      node{
        id
        component{
          id
          repository
          namespace
          name
          version
          componentClass
        }
        author{
          id
          name
          email
          username
          organization
        }
        info{
          id
          name
          humanName
          description
          versionMajor
          versionMinor
          tags
          icon
        }
        osClass
        osRelease
        server
        namespace
        tag
        availablePackageManagers
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
      'modal_visible': false,
      'name': '',
      'description': '',
      'selectedBaseImage': null,
      'selectedBaseImageId': false
    };
  }

  /*
    click handle
    function(object): takes a base image edge
    sets componest state for selectedBaseImageId and selectedBaseImage
  */
  _selectBaseImage(edge){
    this.setState({'selectedBaseImage': edge})
    this.setState({'selectedBaseImageId': edge.node.id})
  }

  /*
    function()
    gets current selectedBaseImage and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  _createBaseImage(){
    let component = this.state.selectedBaseImage.node.component;
    AddEnvironmentComponentMutation(
      this.props.labbookName,
      'default',
      component.repository,
      component.namespace,
      component.name,
      component.version,
      "clientMutationId",
      component.componentClass,
      () => {
        this.props.setBaseImage(this.state.selectedBaseImage)
        if(this.props.setComponent){
          this.props.setComponent(this.props.nextWindow)
        }
      }
    )
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
                    <div className="SelectBaseImage__inner-container flex flex-column justify--space-between">
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
                    <div className="SelectBaseImage__progress-buttons flex flex--row justify--space-between">
                      <button className="SelectBaseImage__progress-button flat--button">
                        Previous
                      </button>
                      <button className="SelectBaseImage__progress-button flat--button">
                        Cancel
                      </button>
                      <button className="SelectBaseImage__progress-button flat--button">
                        skip
                      </button>
                      <button
                        onClick={()=> this._createBaseImage()} disabled={(!this.state.selectedBaseImageId)}>
                        Save and Continue Setup
                      </button>
                    </div>
                  </div>                  )
                }else{
                  return(<div className="Loading"></div>)
                }
              }
          }}
        />

      </div>
      )
  }
}
