//vendor
import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'simplemde'
import { WithContext as ReactTags } from 'react-tag-input';
//components
import Base from 'Components/labbook/environment/Base'
import FilePreview from './FilePreview'
import RecentActivity from './RecentActivity'
import Loader from 'Components/shared/Loader'
import FileEmpty from 'Components/labbook/overview/FileEmpty'
//mutations
import WriteReadmeMutation from 'Mutations/WriteReadmeMutation'
//store
import store from 'JS/redux/store'

let unsubscribe;
let simple;

class Overview extends Component {
  constructor(props) {
    super(props)

    this._openJupyter = this._openJupyter.bind(this)

    this.state = Object.assign({
      editingReadme: false,
      readmeExpanded: false,
      overflowExists: false,
      simpleExists: false,
    }, store.getState().overview);
    this._toggleElements = this._toggleElements.bind(this);
    this._editReadme = this._editReadme.bind(this);
  }
  /*
    subscribe to store to update state
  */
  componentDidMount() {
    this._setExpand();
    unsubscribe = store.subscribe(() => {
      this.storeDidUpdate(Object.assign({}, this.state, store.getState().overview))
    })
  }
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
        fullscreenButton && fullscreenButton.addEventListener('click', this._toggleElements)
      }
    }
  }
  _toggleElements() {
    document.getElementsByClassName('ReactStickyHeader_fixed')[0].className.indexOf('hidden') === -1 ? document.getElementsByClassName('ReactStickyHeader_fixed')[0].classList.add('hidden'): document.getElementsByClassName('ReactStickyHeader_fixed')[0].classList.remove('hidden')
  }
  /*
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()
  }
  /*
    @param {object} overview
    updates components state
  */
  storeDidUpdate = (overview) => {
    if (this.state !== overview) {
      this.setState(overview);
      //triggers re-render when store updates
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

  _closeReadme() {
    this.setState({ editingReadme: false, simpleExists: false });
  }
  _saveReadme() {
    const { owner, labbookName } = store.getState().routes
    WriteReadmeMutation(
      owner,
      labbookName,
      simple.value(),
      (res, error) => {
        if(error) {
          console.log(error)
        } else{
          this.setState({ editingReadme: false, simpleExists: false})
        }
      }
    )
  }
  _editReadme() {
    this.setState({ editingReadme: true });
  }

  render() {
    let readmeCSS = this.state.readmeExpanded ? 'ReadmeMarkdown--expanded' : 'ReadmeMarkdown';
    if (this.props.labbook) {
      const { owner, labbookName } = store.getState().routes
      return (
        <div className="Overview">
          <div className="Overview__title-container">
            <h5 className="Overview__title">Overview</h5>
          </div>
          <div className="Overview__description">
            <ReactMarkdown source={this.props.description} />
          </div>
          <div className="Overview__title-container">
            <h5 className="Overview__title">Readme
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
                <ReactMarkdown className={readmeCSS} source={this.props.readme} />
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
              mainText="This LabBook does not have a readme."
              subText="Click here to create one"
              callback ={this._editReadme}
            />
          }
          <div>
            <RecentActivity recentActivity={this.props.labbook.overview.recentActivity} />
          </div>
          <div className="Overview__title-container">
            <h5 className="Overview__title">Environment</h5>
            <Link
              to={{ pathname: `../../../../labbooks/${owner}/${labbookName}/environment` }}
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
      numCustomDependencies
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
      ...CustomDependencies_environment
    }
  }`
)
