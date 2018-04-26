
import {QueryRenderer, graphql} from 'react-relay'
import React, { Component } from 'react'
import classNames from 'classnames'
//environment
import environment from 'JS/createRelayEnvironment'
//components
import CollaboratorsModal from './CollaboratorsModal'

export const CollaboratorsQuery =  graphql`
  query CollaboratorsQuery($name: String!, $owner: String!){
    labbook(name: $name, owner: $owner){
      collaborators
      canManageCollaborators
    }
  }`


  export default class CollaboratorButton extends Component {
    constructor(props){
    	super(props);
    	this.state = {
        collaboratorModalVisible: false,
        canClickCollaborators: false
      };

      this._toggleCollaborators = this._toggleCollaborators.bind(this)
    }

    _toggleCollaborators(){
      this.setState({collaboratorModalVisible: !this.state.collaboratorModalVisible})
    }

    _getCollaboratorList(collaborators, collaboratorFilteredArr){
      let lastParsedIndex
      let collaboratorSubText = collaboratorFilteredArr ? collaboratorFilteredArr.join(', ') : ''

      if(collaboratorSubText.length > 18 && collaboratorSubText.length){

        collaboratorSubText = collaboratorSubText.slice(0,18)

        lastParsedIndex = collaboratorSubText.split(', ').length -1;

        let lastParsed = collaboratorSubText.split(', ')[lastParsedIndex]

        if(collaborators[lastParsedIndex] !== lastParsed){

          lastParsedIndex--;

          collaboratorSubText = collaboratorSubText.split(', ')
          collaboratorSubText.pop();
          collaboratorSubText = collaboratorSubText.join(', ')

        }

        collaboratorSubText += `...+${collaboratorFilteredArr.length - lastParsedIndex - 1}`

      }
      return collaboratorSubText
    }
    render(){
      let self = this
      const {labbookName, owner} = this.props

      return(
        <QueryRenderer
          query={CollaboratorsQuery}
          environment={environment}
          variables={{
            name: labbookName,
            owner: owner
          }}
          render={({props, error})=>{
              if(props){

                const {labbook} = props
                const collaboratorButtonCSS = classNames({
                  'disabled': !labbook.canManageCollaborators,
                  'BranchMenu__item--flat-button':  true
                })

                const collaboratorCSS = classNames({
                  'BranchMenu__item--collaborators': true,
                  'disabled': !labbook.canManageCollaborators
                })

                const collaboratorFilteredArr = labbook.collaborators && labbook.collaborators.filter((name)=>{
                  return name !== owner
                })

                const collaboratorNames = self._getCollaboratorList(labbook.collaborators, collaboratorFilteredArr)

                return(

                  <li className={collaboratorCSS}
                    >
                    <button
                      onClick={() => this._toggleCollaborators()}
                      className={collaboratorButtonCSS}>
                      Collaborators

                      <p className="BranchMenu__collaborator-names">{collaboratorNames}</p>

                    </button>

                    {
                      this.state.collaboratorModalVisible &&

                        [<CollaboratorsModal
                          key="CollaboratorsModal"
                          ref="collaborators"
                          collaborators={labbook.collaborators}
                          owner={owner}
                          labbookName={labbookName}
                          toggleCollaborators={this._toggleCollaborators}
                        />,
                        <div
                          key="CollaboratorsModal__cover"
                          className="modal__cover"></div>
                      ]

                    }
                  </li>
                )
              }else{

                return(
                  <li className="BranchMenu__item--collaborators disabled"
                    >
                    <button
                      onClick={() => this._toggleCollaborators()}
                      className="BranchMenu__item--flat-button disabled">Collaborators</button>
                  </li>
                )
              }
          }}

        />

      )

    }
  }
