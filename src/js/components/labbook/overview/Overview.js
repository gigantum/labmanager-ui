//vendor
import React, { Component, Fragment } from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'simplemde'
import classNames from 'classnames'
//components
import Base from 'Components/labbook/environment/Base'
import FilePreview from './FilePreview'
import RecentActivity from './RecentActivity'
import Loader from 'Components/shared/Loader'
import FileEmpty from 'Components/labbook/overview/FileEmpty'
import CodeBlock from 'Components/labbook/renderers/CodeBlock'
import ToolTip from 'Components/shared/ToolTip'
//mutations
import WriteReadmeMutation from 'Mutations/WriteReadmeMutation'
import SetLabbookDescriptionMutation from 'Mutations/SetLabbookDescriptionMutation'
//store
import store from 'JS/redux/store'

let simple;

class Overview extends Component {
  constructor(props) {
    super(props)

    this._openJupyter = this._openJupyter.bind(this)

    this.state = {
      editingReadme: false,
      readmeExpanded: false,
      overflowExists: false,
      simpleExists: false,
      editingDescription: false,
      descriptionText: this.props.description.replace(/\n/g,' '),
      lastSavedDescription: this.props.description.replace(/\n/g,' '),
      savingDescription: false,
      editorFullscreen: false,
    };
    this._editReadme = this._editReadme.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }
  /*
    runs state check when component mounts
  */
  componentDidMount() {
    this._setExpand();
    window.addEventListener('click', this._handleClick)
  }
  /*
    runs state check when component updates
  */
  componentDidUpdate() {
    this._setExpand();
    if(!this.state.simpleExists){
      if (document.getElementById('markDown')) {
        simple = new SimpleMDE({
          element: document.getElementById('markDown'),
          spellChecker: true
        });
        simple.value(this.props.readme ? this.props.readme : '')
        this.setState({simpleExists: true})
        let fullscreenButton = document.getElementsByClassName('fa-arrows-alt')[0]
        fullscreenButton && fullscreenButton.addEventListener('click', () => this.setState({editorFullscreen: !this.state.editorFullscreen}))
        let sideBySideButton = document.getElementsByClassName('fa-columns')[0]
        sideBySideButton && sideBySideButton.addEventListener('click', () => this.setState({editorFullscreen: true}))
      }
    }
  }

  _openJupyter() {
    window.open('http://localhost:8888', '_blank')
  }


  checkOverflow(el) {
    var curOverflow = el.style.overflow;

    if (!curOverflow || curOverflow === "visible")
      el.style.overflow = "hidden";

    var isOverflowing = el.clientWidth < el.scrollWidth
      || el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;
    return isOverflowing;
  }
  _setExpand() {
    let element = Array.prototype.slice.call(document.getElementsByClassName('ReadmeMarkdown'))[0];
    if(element && this.checkOverflow(element) && !this.state.overflowExists){
      this.setState({overflowExists: true})
    } else if(element && !this.checkOverflow(element) && this.state.overflowExists) {
      this.setState({overflowExists: false});
    }
  }
  /**
   @param {event} evt
   hides warning when not clicked on
   */
  _handleClick(evt){
    if((evt.target.className.indexOf('Overview__readme-save') === -1) && this.state.readMeWarning){
      this.setState({readMeWarning: null});
    }
  }
  _closeReadme() {
    this.setState({ editingReadme: false, simpleExists: false });
  }
  _saveReadme() {
    if(this.props.isPublishing){
      this.setState({readMeWarning: 'publishing'})
    } else if(this.props.isSyncing){
      this.setState({readMeWarning: 'syncing'})
    } else{
      const { owner, labbookName } = store.getState().routes
      WriteReadmeMutation(
        owner,
        labbookName,
        simple.value(),
        (res, error) => {
          if(error) {
            console.log(error)
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: 'Readme was not set: ',
                messageBody: error
              }
            })
          } else{
            this.setState({ editingReadme: false, simpleExists: false})
          }
        }
      )
    }
  }
  _editReadme() {
    this.setState({ editingReadme: true });
  }

  _saveDescription() {
    const { owner, labbookName } = store.getState().routes
    this.setState({savingDescription: true})
    SetLabbookDescriptionMutation(
      owner,
      labbookName,
      this.state.descriptionText.replace(/\n/g,' '),
      (res, error) => {
        if(error) {
          console.log(error)
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: 'Description was not set: ',
              messageBody: error
            }
          })
        } else{
          this.setState({ editingDescription: false, lastSavedDescription: this.state.descriptionText.replace(/\n/g,' '), savingDescription: false})
        }
      }
    )
  }
  _editingDescription() {
    this.setState({ editingDescription: true });
  }

  /**
    *  @param {Object} nextprops
    *  fires when component recieves props
    *  changes the description text, particularly used when switching branches
  */
  UNSAFE_componentWillReceiveProps(nextProps){
    this.setState({descriptionText: nextProps.description.replace(/\n/g,' '), lastSavedDescription: nextProps.description.replace(/\n/g,' ')})
  }

  render() {
    let overviewCSS = classNames({
      'Overview': true,
      'fullscreen': this.state.editorFullscreen
    })
    let readmeCSS = classNames({
      'ReadmeMarkdown--expanded': this.state.readmeExpanded,
      'ReadmeMarkdown': !this.state.readmeExpanded
    })
    let descriptionCSS = this.state.descriptionText ? 'column-1-span-10' : 'column-1-span-10 empty'
    if (this.props.labbook) {
      const { owner, labbookName } = store.getState().routes
      return (
        <div className={overviewCSS}>
          <ToolTip section="descriptionOverview"/>
          <div className="Overview__description grid column-1-span-12">
          {
            this.state.editingDescription ?
            <Fragment>
              <textarea
                maxLength="260"
                className="Overview__description-input column-1-span-10"
                type="text"
                onChange={(evt)=>{this.setState({descriptionText: evt.target.value.replace(/\n/g,' ')})}}
                placeholder="Short description of Project"
                defaultValue={this.state.descriptionText ? this.state.descriptionText: ''}
              >
              </textarea>
              <div className="column-1-span-1">
                <button
                  disabled={this.state.savingDescription}
                  onClick={()=> this._saveDescription()}
                  className="Overview__description-save-button"
                >
                  Save
                </button>
                <button
                  onClick={()=> this.setState({editingDescription: false, descriptionText: this.state.lastSavedDescription })}
                  className="Overview__description-cancel-button button--flat"
                >
                  Cancel
                </button>
              </div>
            </Fragment>
            :
            <Fragment>
              <ReactMarkdown className={descriptionCSS} source={this.state.descriptionText ? this.state.descriptionText : 'No description provided.'} />
              <div className="column-1-span-1">
                <button
                  onClick={()=> this.setState({editingDescription: true})}
                  className="Overview__description-edit-button"
                >
                </button>
              </div>
            </Fragment>
          }
          </div>
          <div className="Overview__title-container">
            <h5 className="Overview__title">Readme <ToolTip section="readMe"/>
            <button
              className={this.state.editingReadme || !this.props.readme ? 'hidden': 'Overview__readme-edit-button'}
              onClick={()=>this.setState({ editingReadme: true })}
            >
            </button>
            </h5>
          </div>
          {
            this.state.editingReadme &&
            <div className={this.state.editingReadme ? 'Overview__readme--editing' : 'hidden'}>
              <textarea ref="markdown"
                className="Overview__readme-editor"
                id="markDown"></textarea>
              <div className="Overview__readme--editing-buttons">
                <button
                  className="Overview__readme-save"
                  disabled={false}
                  onClick={() => { this._saveReadme() }}>Save
                </button>
                {
                  this.state.readMeWarning &&
                  <Fragment>

                    <div className="BranchMenu__menu-pointer">
                    </div>

                    <div className="BranchMenu__button-menu">
                      Readme cannot be edited while project is {this.state.readMeWarning}.
                    </div>

                  </Fragment>
                }
                <button
                  className="Overview__readme-cancel"
                  onClick={() => { this._closeReadme() }}>Cancel
                </button>
              </div>
            </div>
          }
          {
            this.props.readme ?
              <div
                className={this.state.editingReadme ? 'hidden' : 'Overview__readme'}
              >
                <ReactMarkdown className={readmeCSS} source={this.props.readme}  renderers={{code: props => <CodeBlock  {...props }/>}} />
                {
                  this.state.overflowExists && !this.state.readmeExpanded &&
                  <div className="Overview__readme-fadeout"></div>
                }
                <div className="Overview__readme-buttons">
                  {
                    this.state.overflowExists && (this.state.readmeExpanded ?
                    <div className="Overview__readme-bar-less">
                      <button
                        className="Overview__readme-less"
                        onClick={() => { this.setState({ readmeExpanded: false }) }}
                      >
                        Collapse
                      </button>
                    </div>
                      :
                      <div className="Overview__readme-bar-more">
                        <button
                          className="Overview__readme-more"
                          onClick={() => { this.setState({ readmeExpanded: true }) }}
                        >
                          Expand
                        </button>
                      </div>)
                  }
                </div>
              </div>
              :
              !this.state.editingReadme &&
            <FileEmpty
              section="edit"
              mainText="This Project does not have a readme."
              subText="Click here to create one"
              callback ={this._editReadme}
            />
          }
          <div>
            <RecentActivity recentActivity={this.props.labbook.overview.recentActivity} scrollToTop={this.props.scrollToTop} />
          </div>
          <div className="Overview__title-container">
            <h5 className="Overview__title">Environment<ToolTip section="environmentOverview"/></h5>
            <Link
              onClick={this.props.scrollToTop}
              to={{ pathname: `../../../../projects/${owner}/${labbookName}/environment` }}
              replace
            >
              Environment Details >
              </Link>
          </div>
          <div className="Overview__environment">
            <Base
              ref="base"
              environment={this.props.labbook.environment}
              blockClass="Overview"
              overview={this.props.labbook.overview}
            />
          </div>

          <div>
            <FilePreview
              ref="filePreview"
              scrollToTop={this.props.scrollToTop}
            />
          </div>


        </div>
      )
    } else {
      return (<Loader />)
    }
  }
}


export default createFragmentContainer(
  Overview,
  graphql`fragment Overview_labbook on Labbook {
    overview{
      id
      owner
      name
      numAptPackages
      numConda2Packages
      numConda3Packages
      numPipPackages
      recentActivity{
        id
        owner
        name
        message
        detailObjects {
          id
          data
        }
        type
        timestamp
        username
        email
      }
      remoteUrl
    }
    environment{
      id
      imageStatus
      containerStatus
      ...Base_environment
    }
  }`
)
