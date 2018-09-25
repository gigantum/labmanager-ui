// vendor
import React from 'react';
import uuidv4 from 'uuid/v4';
// utilities
import validation from 'JS/utils/Validation';
// components
import LoginPrompt from 'Components/labbook/labbookHeader/branchMenu/modals/LoginPrompt';
// mutations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation';
import BuildImageMutation from 'Mutations/BuildImageMutation';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// store
import { setMultiInfoMessage } from 'JS/redux/reducers/footer';

export default class CreateLabbook extends React.Component {
  constructor(props) {
  	super(props);

  	this.state = {
      name: '',
      description: '',
      showError: false,
      errorType: '',
      remoteURL: '',
      textWarning: 'CreateLabbook__warning--hidden',
      textLength: 0,
      isUserValid: false,
      showLoginPrompt: false,
    };

    this.continueSave = this.continueSave.bind(this);
    this._updateTextState = this._updateTextState.bind(this);
    this._updateRemoteUrl = this._updateRemoteUrl.bind(this);
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this);
  }

  /**
  *   @param {Object} evt
  *   takes an event input
  *   creates a labbook mutation sets labbook name on parent component
  *   triggers setComponent to proceed to next view
  * */
  continueSave = (evt) => {
    const { name, description } = this.state;
    const id = uuidv4();

    const self = this;

    if (this.state.remoteURL.length > 0) {
      const labbookName = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 1];
      const owner = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 2];
      const remote = this.state.remoteURL.indexOf('https://') > -1 ? `${this.state.remoteURL}.git` : `https://${this.state.remoteURL}.git`;

      UserIdentity.getUserIdentity().then((response) => {
        if (navigator.onLine) {
          if (response.data) {
            if (response.data.userIdentity.isSessionValid) {
              setMultiInfoMessage(id, 'Importing Project please wait', false, false);
              ImportRemoteLabbookMutation(
                owner,
                labbookName,
                remote,
                (response, error) => {
                  if (error) {
                    console.error(error);
                    setMultiInfoMessage(id, 'ERROR: Could not import remote Project', null, true, error);
                  } else if (response) {
                    const labbookName = response.importRemoteLabbook.newLabbookEdge.node.name;
                    const owner = response.importRemoteLabbook.newLabbookEdge.node.owner;
                    setMultiInfoMessage(id, `Successfully imported remote Project ${labbookName}`, true, false);

                    BuildImageMutation(
                      labbookName,
                      owner,
                      false,
                      (response, error) => {
                        if (error) {
                          console.error(error);
                          setMultiInfoMessage(id, `ERROR: Failed to build ${labbookName}`, null, true, error);
                        }
                      },
                    );
                    self.props.history.replace(`/projects/${owner}/${labbookName}`);
                  } else {
                    BuildImageMutation(
                      labbookName,
                      localStorage.getItem('username'),
                      false,
                      (response, error) => {
                        if (error) {
                          console.error(error);
                          setMultiInfoMessage(id, `ERROR: Failed to build ${labbookName}`, null, true, error);
                        }
                      },
                    );
                  }
                },
              );
            } else {
              this.props.auth.renewToken(true, () => {
                setMultiInfoMessage(id, 'ERROR: User session not valid for remote import', null, true, [{ message: 'User must be authenticated to perform this action.' }]);
                this.setState({ showLoginPrompt: true });
              }, () => {
                this.continueSave();
              });
            }
          }
        } else {
          this.setState({ showLoginPrompt: true });
        }
      });
    } else {
      this.props.createLabbookCallback(name, description);
    }
  }
  /**
  *  @param {}
  *  closes login prompt modal
  *  @return {}
  */
  _closeLoginPromptModal() {
    this.setState({
      showLoginPrompt: false,
    });
  }
  /**
    @param {Object, string} evt,field
    updates text in a state object and passes object to setState method
  */
  _updateTextState = (evt, field) => {
    const state = {};

    state[field] = evt.target.value;
    if (field === 'name') {
      const isMatch = validation.labbookName(evt.target.value);
      this.setState({
        showError: ((isMatch === false) && (evt.target.value.length > 0)),
        errorType: '',
      });

      this.props.toggleDisabledContinue((evt.target.value === '') || (isMatch === false));
    }
    const textLength = 260 - evt.target.value.length;
    if (textLength >= 100) {
      state.textWarning = 'CreateLabbook__warning--hidden';
    } else if ((textLength <= 100) && (textLength > 50)) {
      state.textWarning = 'CreateLabbook__warning--green';
    } else if ((textLength <= 50) && (textLength > 20)) {
      state.textWarning = 'CreateLabbook__warning--yellow';
    } else {
      state.textWarning = 'CreateLabbook__warning--red';
    }
    state.textLength = textLength;

    this.setState(state);
  }


  /**
    @param {}
    returns error message
    @return {string} errorMessage
  */
  _getErrorText() {
    return this.state.errorType === 'send' ? 'Error: Last character cannot be a hyphen.' : 'Error: Title may only contain lowercase alphanumeric and `-`. (e.g. lab-book-title)';
  }

  /**
    @param {event} evt
    updates remote url state
  */
  _updateRemoteUrl(evt) {
    this.setState({
      remoteURL: evt.target.value,
    });
    if (evt.target.value.length > 0) {
      this.props.toggleDisabledContinue(false);
    } else {
      this.props.toggleDisabledContinue(true);
    }
  }

  render() {
    return (
      <div className="CreateLabbook">
        {
          this.state.showLoginPrompt &&
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        }
        <div>
          <div>
            <label>Title</label>
            <input
              type="text"
              maxLength="36"
              className={this.state.showError ? 'invalid' : ''}
              onChange={evt => this._updateTextState(evt, 'name')}
              placeholder="Enter a unique, descriptive title"
            />
            <span className={this.state.showError ? 'error' : 'hidden'}>{this._getErrorText()}</span>
          </div>

          <div>
            <label>Description</label>
            <textarea
              maxLength="260"
              className="CreateLabbook__description-input"
              type="text"
              onChange={evt => this._updateTextState(evt, 'description')}

              placeholder="Briefly describe this Project, its purpose and any other key details. "
            />
            <p className={`CreateLabbook__warning ${this.state.textWarning}`}>{`${this.state.textLength} characters remaining`}</p>
          </div>

        </div>
      </div>
    );
  }
}
