import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import environment from './../../createRelayEnvironment'
//import CreateLabbookMutation from './../../mutations/CreateLabbookMutation'

const BaseImageQuery = graphql`query SelectBaseImageQuery($first: Int!, $cursor: String){
  availableBaseImages(first: $first, after: $cursor){
    edges{
      node{
        id
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
        repo
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
      'selectedBaseImage': {},
      'selectedBaseImageId': false
    };
  }
  _createEnvironment(evt){
    let viewerId = 'localLabbooks';//Todo: figure out what to do with viewerId in the mutation context
    let name = this.state.name;

    //create new labbook
    // CreateLabbookMutation(
    //   this.state.description,
    //   name,
    //   viewerId,
    //   () => this.props.history.replace(`/labbooks/${name}`) //route to new labbook on callback
    // )

    this._hideModal();
    this.props.handler(evt);
  }
  /*
    evt:object, field:string - updates text in a state object and passes object to setState method
  */
  _updateTextState(evt, field){
    let state = {}
    state[field] = evt.target.value;
    this.setState(state)
  }

  _selectBaseImage(edge){
    console.log(edge)
    this.setState({'selectedBaseImage': edge})
    this.setState({'selectedBaseImageId': edge.node.id})
  }

  _createBaseImage(){
    console.log(this.state.selectedBaseImage)
  }

  render(){

    return(
      <div className="SelectBaseImage">

        <p> Select a Base Image </p>
        <QueryRenderer
          variables={{
            first: 20
          }}
          query={BaseImageQuery}
          environment={environment}
          render={({error, props}) =>{
              console.log(error, props);
              if(error){
                console.log('asads')
                return(<div>{error.message}</div>)
              }else{
                if(props){
                  return(
                    <div className="SelectBaseImage__inner-container">
                      <div className="SelectBaseImage__images flex flex--row flex--wrap justify--space-around">
                      {
                        props.availableBaseImages.edges.map((edge) => {

                            return(
                              <div className={(this.state.selectedBaseImageId === edge.node.id) ? 'SelectBaseImage__image--selected': 'SelectBaseImage__image'} onClick={()=> this._selectBaseImage(edge)} key={edge.node.id}>
                                <img alt="" src={edge.node.info.icon} height="50" width="50" />
                                <p>{edge.node.info.humanName}</p>
                              </div>
                            )
                        })
                      }


                      </div>
                    <button onClick={()=> this._createBaseImage()} disabled={(!this.state.selectedBaseImageId)}>Next</button>
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
