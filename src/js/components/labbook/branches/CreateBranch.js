//vendor
import React from 'react';
import classNames from 'classnames';
import dateFormat from 'dateformat';
//components
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
//utilities
import validation from 'JS/utils/Validation'

export default class CreateBranchModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'modalVisible': false,
            'showLoginPrompt': false,
            'textWarning': 'hidden',
            'textLength': 0,
            'showError': false,
        };
        this._showModal = this._showModal.bind(this);
    }
    _showModal() {
        this.setState({ 'modalVisible': true });
    }
    _hideModal() {
        this.setState({ 'modalVisible': false });
        document.getElementById('modal__cover').classList.add('hidden')
    }

    _getErrorText(){
        return this.state.errorType === 'send' ? 'Error: Last character cannot be a hyphen.' : 'Error: Branch name may only contain lowercase alphanumeric and `-`. (e.g. new-branch-name)'
      }

    _updateTextState = (evt, field) =>{
        let state = {}

        state[field] = evt.target.value;
        if(field === 'name'){
          let isMatch = validation.labbookName(evt.target.value)
          this.setState({
          'showError': ((isMatch === false) && (evt.target.value.length > 0)),
          'errorType': ''
          })

        }
        let textLength = 240 - evt.target.value.length
        if(textLength >= 100){
          state['textWarning'] = 'CreateBranch__warning--hidden'
        }else if((textLength <= 100) && (textLength > 50)){
          state['textWarning'] = 'CreateBranch__warning--green'
        }else if((textLength <= 50) && (textLength > 20)){
          state['textWarning'] = 'CreateBranch__warning--yellow'
        }else{
          state['textWarning'] = 'CreateBranch__warning--red'
        }
        state['textLength'] = textLength;

        this.setState(state)
      }
      _formattedISO(date){
        return dateFormat(date, "isoDateTime").toLowerCase().replace(/:/g, '-')
      }

    render() {
        let loginPromptModalCss = classNames({
            'CreateBranch--login-prompt': this.state.showLoginPrompt,
            'hidden': !this.state.showLoginPrompt
          })
        return (
            <div>
                {this.state.modalVisible &&
                    <div className="CreateBranch__container">
                        <div className="CreateBranch__modal">
                            <div
                                className="CreateBranch__modal-close"
                                onClick={() => this._hideModal()}>
                            </div>

                            <div className="CreateBranch">
                                <div className={loginPromptModalCss}>
                                    <div
                                        onClick={() => { this._closeLoginPromptModal() }}
                                        className="BranchModal--close"></div>
                                    <LoginPrompt closeModal={this._closeLoginPromptModal} />
                                </div>
                                <h4 className="CreateBranch__header">Create Branch</h4>
                                <div className='CreateBranch__modal-inner-container flex flex--column justify--space-between'>

                                    <div>
                                        <label>Name</label>
                                        <input
                                            type='text'
                                            maxLength="100"
                                            className={this.state.showError ? 'invalid' : ''}
                                            onChange={(evt) => this._updateTextState(evt, 'name')}
                                            placeholder="Enter a unique branch name"
                                            defaultValue={this.props.selected ? 'rollback-' + this._formattedISO(this.props.selected.timestamp) : ''}
                                        />
                                        <span className={this.state.showError ? 'error' : 'hidden'}>{this._getErrorText()}</span>
                                    </div>

                                    <div>
                                        <label>Description</label>
                                        <textarea
                                            maxLength="240"
                                            className="CreateBranch__description-input"
                                            type="text"
                                            onChange={(evt) => this._updateTextState(evt, 'description')}
                                            placeholder="Briefly describe this branch, its purpose and any other key details. "
                                            defaultValue={this.props.selected ? `Rollback branch created on ${this._formattedISO(Date.now())} to export '${this.props.activeBranch.name}' on ${this._formattedISO(this.props.selected.timestamp)}` : ''}
                                        />
                                        <p className={'CreateBranch__warning ' + this.state.textWarning}>{`${this.state.textLength} characters remaining`}</p>
                                    </div>
                                </div>
                            </div>



                            <div className={'CreateBranchNav'}>
                                <div>
                                </div>
                                <div className="CreateBranch__nav-group">
                                    <button
                                        onClick={() => { this._hideModal() }}
                                        className="CreateBranch__progress-button button--flat">
                                        Cancel
                    </button>
                                    <button
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}