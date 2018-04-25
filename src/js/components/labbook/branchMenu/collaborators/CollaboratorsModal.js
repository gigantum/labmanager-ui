//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//Mutations
import AddCollaboratorMutation from 'Mutations/AddCollaboratorMutation'
import DeleteCollaboratorMutation from 'Mutations/DeleteCollaboratorMutation'
//components
import ButtonLoader from 'Components/shared/ButtonLoader'
//store
import store from 'JS/redux/store'

export default class DeleteLabbook extends Component {
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
      'buttonLoaderAddCollaborator': ''
    };

    this._addCollaborator = this._addCollaborator.bind(this)
    this._removeCollaborator = this._removeCollaborator.bind(this)
  }

  componentDidMount() {
    let buttonLoaderRemoveCollaborator = {}


    this.props.collaborators.forEach((collaborator) => {

      buttonLoaderRemoveCollaborator[collaborator] = ''
    })

    this.setState({buttonLoaderRemoveCollaborator})
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
    if ((evt.type === 'click') || (evt.key === "Enter")) {
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

          this.inputTitle.value = ''

          if (error) {
            console.log(error)
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
            setTimeout(()=>{
              this.setState({buttonLoaderAddCollaborator: ''})
            }, 2000)
          }
        }

      )
    } else {
      this.setState({ newCollaborator: evt.target.value })
    }
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

    return(
      <div className="CollaboratorModal">
        <div
          onClick={() => { this.props.toggleCollaborators() }}
          className="CollaboratorModal__button--close">
        </div>
        <h4
          className="CollaboratorModal__header">Manage Collaborators</h4>
        <hr />

        <div className="CollaboratorModal__container">

          <div className="CollaboratorModal__add">

            <input
              className="CollaboratorModal__input--collaborators"
              ref={el => this.inputTitle = el}

              onChange={(evt) => this._addCollaborator(evt)}
              onKeyUp={(evt) => this._addCollaborator(evt)}

              type="text"
              placeholder="Add Collaborator"
            />

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

      </div>
    )
  }
}