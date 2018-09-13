//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//Mutations
import AddCollaboratorMutation from 'Mutations/AddCollaboratorMutation'
import DeleteCollaboratorMutation from 'Mutations/DeleteCollaboratorMutation'
//components
import ButtonLoader from 'Components/shared/ButtonLoader'
import Modal from 'Components/shared/Modal'
//store
import store from 'JS/redux/store'
//config
import config from 'JS/config'
import fetchQuery from 'JS/fetch'

export default class CollaboratorModal extends Component {
  constructor(props){
  	super(props);
    const {
      labbookName,
      owner
    } = props

  	this.state = {
      labbookName,
      owner,
      'addCollaboratorButtonDisabled': false,
      'newCollaborator': '',
      'buttonLoaderRemoveCollaborator': {},
      'buttonLoaderAddCollaborator': '',
      'colloboratorSearchList': [],
      'selectedIndex': 0
    };

    this._addCollaborator = this._addCollaborator.bind(this)
    this._removeCollaborator = this._removeCollaborator.bind(this)
    this._completeColloborator = this._completeColloborator.bind(this)
  }

  componentDidMount() {
    let buttonLoaderRemoveCollaborator = {}


    this.props.collaborators.forEach((collaborator) => {

      buttonLoaderRemoveCollaborator[collaborator] = ''
    })

    this.setState({buttonLoaderRemoveCollaborator})
  }

  /**
  *  @param {Int}
  *  iterate value of index within the bounds of the array size
  *  @return {}
  */
  _setSelectedIndex(iterate){
    let newSelectedIndex = this.state.selectedIndex + iterate;
    newSelectedIndex = (newSelectedIndex < 0) ? this.state.colloboratorSearchList.length - 1 : newSelectedIndex
    newSelectedIndex = (newSelectedIndex >= this.state.colloboratorSearchList.length) ? 0 : newSelectedIndex

    this.setState({'selectedIndex': newSelectedIndex});
  }
  /**
  *  @param {event} evt
  *  queries collaborator api and updates list
  *  @return {}
  */
  _getUsers(evt){
    let userInput = evt.target.value
    if((userInput.length > 2) && (evt.key !== "Enter")){
      const apiURL = evt.target.value.indexOf('@') > 0 ? config.userAPI.getUserEmailQueryString(evt.target.value) : config.userAPI.getUsersQueryString(evt.target.value)

      fetchQuery(apiURL).then((response) => {

          let collaborators = response.hits.hit.map((hit)=>{
            return hit.fields
          })

          this.setState({colloboratorSearchList: collaborators})
      })
    }else{
      this.setState({colloboratorSearchList: []})
    }


    this._handleInputKeys(evt)

  }


  /**
  *  @param {event} evt
  *  queries collaborator api and updates list
  *  @return {}
  */
  _handleInputKeys(evt){
    if ((evt.type === 'click') || (evt.key === "Enter")) {

      if(this.state.colloboratorSearchList.length > 0){

          const collaborator = this.state.colloboratorSearchList[this.state.selectedIndex]

          this._completeColloborator(collaborator)
      }else{
        this._addCollaborator()
      }
    } else if(evt.key === 'ArrowDown'){

      this._setSelectedIndex(1)

    }else if (evt.key === 'ArrowUp'){

      this._setSelectedIndex(-1)

    }else {

      this.setState({ newCollaborator: evt.target.value })

    }
  }
  /**
  *  @param {event} evt
  *  queries collaborator api and updates list
  *  @return {}
  */
  _completeColloborator(collaborator){
    if(collaborator){

      this.collaboratorSearch.value = collaborator.username

      this.setState({
        newCollaborator: collaborator.username,
        colloboratorSearchList: [],
        selectedIndex: 0
      })
    }

  }
  /**
  *  @param {event} evt
  *  sets state of Collaborators
  *  @return {}
  */
  _addCollaborator(evt) {
    const {
      labbookName,
      owner,
      newCollaborator } = this.state

      //waiting for backend updates
      this.setState({addCollaboratorButtonDisabled: true, buttonLoaderAddCollaborator: 'loading'})

      AddCollaboratorMutation(
        labbookName,
        owner,
        newCollaborator,
        (response, error) => {

          let {buttonLoaderRemoveCollaborator} = this.state

          buttonLoaderRemoveCollaborator[newCollaborator] = ''

          this.setState({ newCollaborator: '', addCollaboratorButtonDisabled: false, buttonLoaderRemoveCollaborator})

          this.collaboratorSearch.value = ''

          if (error) {

            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `Could not add collaborator`,
                messageBody: error
              }
            })

            this.setState({buttonLoaderAddCollaborator: 'error'})

          } else {
            this.setState({buttonLoaderAddCollaborator: 'finished'})

          }

          setTimeout(()=>{
            this.setState({buttonLoaderAddCollaborator: ''})
          }, 2000)
        }

      )

  }
  /**
  *  @param {object} params
  *  deletes collaborators using mutation
  *  @return {}
  */
  _removeCollaborator(evt, params) {

    const {collaborator, button} = params

    button.disabled = true;

    let {buttonLoaderRemoveCollaborator} = this.state

    buttonLoaderRemoveCollaborator[collaborator] = 'loading'

    this.setState({buttonLoaderRemoveCollaborator})

    DeleteCollaboratorMutation(
      this.state.labbookName,
      this.state.owner,
      collaborator,
      (response, error) => {
        this.refs[collaborator] && this.refs[collaborator].classList.remove('loading');
        if(button){
          button.disabled = false;
        }
        if (error) {
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `Could not remove collaborator`,
              messageBody: error
            }
          })

          buttonLoaderRemoveCollaborator[collaborator] = 'error'

          this.setState({buttonLoaderRemoveCollaborator})
        }else{
          buttonLoaderRemoveCollaborator[collaborator] = 'finished'

          this.setState({buttonLoaderRemoveCollaborator})
        }

        setTimeout(() => {
          buttonLoaderRemoveCollaborator[collaborator] = ''

          this.setState({buttonLoaderRemoveCollaborator})
        }, 2000)
      }
    )
  }

  render(){
    const autoCompleteMenu = classNames({
      'CollaboratorModal__auto-compelte-menu': true,
      'CollaboratorModal__auto-compelte-menu--visible': this.state.colloboratorSearchList.length > 0
    })
    return(
      <Modal
        header="Manage Collaborators"
        icon="user"
        size="large"
        handleClose={() => { this.props.toggleCollaborators() }}
        renderContent={()=>
          <div>

          <div className="CollaboratorModal__add">

            <input
              className="CollaboratorModal__input--collaborators"
              ref={el => this.collaboratorSearch = el}

              onChange={(evt) => this._getUsers(evt)}
              onKeyUp={(evt) => this._getUsers(evt)}

              type="text"
              placeholder="Add Collaborator"

              disabled={this.state.addCollaboratorButtonDisabled}
            />

            <div className={autoCompleteMenu}>
              <ul className="CollaboratorModal__list">
                {
                  this.state.colloboratorSearchList.map((collaborator, index)=>{

                    const listItemCSS = classNames({
                      'CollaboratorModal__list-item': true,
                      'CollaboratorModal__list-item--selected': (index === this.state.selectedIndex )
                    })
                    return <li
                      onClick={() => this._completeColloborator(collaborator)}
                      className={listItemCSS}
                      key={collaborator.username}>

                      <div className="CollaboratorModal__list-item--username">{collaborator.username}</div>

                      <div className="CollaboratorModal__list-item--name">{collaborator.name}</div>

                   </li>
                  }
                  )
                }
              </ul>
            </div>

            <ButtonLoader
              className="CollaboratorModal__button--add"
              ref="addCollaborator"

              buttonState={this.state.buttonLoaderAddCollaborator}
              buttonText={""}

              params={{}}
              buttonDisabled={this.state.addCollaboratorButtonDisabled || !this.state.newCollaborator.length}
              clicked={this._addCollaborator}
            />

          </div>

          <div className="CollaboratorModal__collaborators">

            <h5 className="CollaboratorModal__sub-header">Collaborators</h5>

            <div className="CollaboratorModal__list-container">

              {this.props.collaborators &&

                <ul className="CollaboratorModal__list">
                  {
                    this.props.collaborators.map((collaborator) => {

                      const collaboratorItemCSS = classNames({
                        "CollaboratorModal--item-me": collaborator === localStorage.getItem('username'),
                        "CollaboratorModal--item": !(collaborator === localStorage.getItem('username'))
                      })

                      return (

                        <li
                          key={collaborator}
                          ref={collaborator}
                          className={collaboratorItemCSS}>

                            <div>{collaborator}</div>

                            <ButtonLoader
                              ref={collaborator}
                              buttonState={this.state.buttonLoaderRemoveCollaborator[collaborator]}
                              buttonText={""}
                              className="CollaboratorModal__button"
                              params={{collaborator, button: this}}
                              buttonDisabled={collaborator === localStorage.getItem('username')}
                              clicked={this._removeCollaborator}
                            />

                        </li>)

                    })

                  }

                </ul>

              }

            </div>
          </div>
        </div>
        }
      />
    )
  }
}
