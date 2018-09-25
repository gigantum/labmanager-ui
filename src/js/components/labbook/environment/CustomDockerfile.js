// vendor
import React, { Component, Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
// Components
import CodeBlock from 'Components/labbook/renderers/CodeBlock';
import ToolTip from 'Components/shared/ToolTip';
// mutations
import AddCustomDockerMutation from 'Mutations/AddCustomDockerMutation';
// store
import store from 'JS/redux/store';
import { setContainerMenuWarningMessage } from 'JS/redux/reducers/labbook/environment/environment';
// config
import { setErrorMessage, setWarningMessage } from 'JS/redux/reducers/footer';
import config from 'JS/config';
// assets
import './CustomDockerfile.scss';

export default class CustomDockerfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalDockerfile: this.props.dockerfile,
      dockerfileContent: this.props.dockerfile,
      lastSavedDockerfileContent: this.props.dockerfile,
      editingDockerfile: false,
      savingDockerfile: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.dockerfile !== state.originalDockerfile) {
      return {
        ...state,
        originalDockerfile: props.dockerfile,
        dockerfileContent: props.dockerfile,
        lastSavedDockerfileContent: props.dockerfile,
      };
    }
    return state;
  }

  _saveDockerfile() {
    const { status } = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked;
    const { owner, labbookName } = store.getState().routes;
    if (navigator.onLine) {
      if (canEditEnvironment) {
        const validDictionary = new Set(['LABEL', 'RUN', 'ENV', '#']);
        const splitDockerSnippet = this.state.dockerfileContent.split(/\n|\\n/);
        let valid = true;
        splitDockerSnippet.forEach((snippetLine, index) => {
          const firstVal = snippetLine.split(' ')[0];
          const previousLine = splitDockerSnippet[index - 1] && splitDockerSnippet[index - 1];
          let isPreviousLineExtended = false;

          if (previousLine) {
            const strippedSpaces = previousLine.split(' ').join('');
            isPreviousLineExtended = strippedSpaces[strippedSpaces.length - 1] === '\\';
          }

          if ((firstVal.length && !validDictionary.has(firstVal.toUpperCase()) && firstVal[0] !== '#') && !isPreviousLineExtended) {
            valid = false;
          }
        });

        if (valid) {
          this.setState({ savingDockerfile: true });

          AddCustomDockerMutation(
            owner,
            labbookName,
            this.state.dockerfileContent,
            (res, error) => {
              if (error) {
                console.log(error);
                setErrorMessage('Dockerfile was not set: ', error);
                this.setState({ savingDockerfile: false });
              } else {
                this.props.buildCallback();
                this.setState({ editingDockerfile: false, lastSavedDockerfileContent: this.state.dockerfileContent, savingDockerfile: false });
              }
            },
          );
        } else {
          setWarningMessage('Invalid command entered. Commands must begin with: LABEL, RUN, ENV, or #');
        }
      } else {
        setContainerMenuWarningMessage('Stop Project before editing the environment. \n Be sure to save your changes.');
      }
    } else {
      setErrorMessage('Cannot remove package at this time.', [{ message: 'An internet connection is required to modify the environment.' }]);
    }
  }

  _editDockerfile() {
    const { status } = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked;
    if (canEditEnvironment) {
      this.setState({ editingDockerfile: true });
    } else {
      setContainerMenuWarningMessage('Stop Project before editing the environment. \n Be sure to save your changes.');
    }
  }


  render() {
    const dockerfileCSS = classNames({
      'column-1-span-11': true,
      empty: !this.state.dockerfileContent,
    });

    const renderedContent = this.state.dockerfileContent ? `\`\`\`\n${this.state.dockerfileContent}\n\`\`\`` : 'No commands provided.';

    return (
      <div className="CustomDockerfile">

        <div className="Environment__headerContainer">

          <h5 className="CustomDockerfile__header">
            Custom Docker Instructions <ToolTip section="dockerInstructionsEnvironment" />
            {
              !this.state.editingDockerfile &&
              <button
                onClick={() => this._editDockerfile()}
                className="CustomDockerfile__btn--edit"
              />
            }
          </h5>

        </div>

        <div className="CustomDockerfile__sub-header">

          <p>Add commands below to modify your environment. Note: Docker instructions are executed after packages are installed.</p>

          <div className="CustomDockerfile--code-snippet flex">
            <p>For example, to install a pip package from a Github repo add:</p>
            <code>RUN pip install git+https://git.repo/some_pkg.git</code>
          </div>

        </div>

        <div className="CustomDockerfile__content Card Card--auto Card--no-hover grid column-1-span-12">
          {
            this.state.editingDockerfile ?

              <Fragment>

                <textarea
                  className="CustomDockerfile__textarea"
                  type="text"
                  onChange={(evt) => { this.setState({ dockerfileContent: evt.target.value }); }}
                  placeholder="Enter dockerfile commands here"
                  defaultValue={this.state.dockerfileContent ? this.state.dockerfileContent : ''}
                />

                <div className="CustomDockerfile__buttonContainer">

                  <div className="column-1-span-2">

                    <button
                      onClick={() => this.setState({ editingDockerfile: false, dockerfileContent: this.state.lastSavedDockerfileContent })}
                      className="CustomDockerfile__content-cancel-button button--flat"
                    >
                    Cancel
                    </button>

                    <button
                      disabled={this.state.savingDockerfile}
                      onClick={() => this._saveDockerfile()}
                      className="CustomDockerfile__content-save-button"
                    >
                    Save
                    </button>

                  </div>

                </div>

              </Fragment>

            :

              <Fragment>

                <div className={dockerfileCSS}>

                  <ReactMarkdown
                    renderers={{
code: props =>
  <CodeBlock {...props} language="dockerfile" />,
}
                      }
                    className="ReactMarkdown"
                    source={renderedContent}
                  />

                </div>

              </Fragment>
          }

        </div>

      </div>
    );
  }
}
