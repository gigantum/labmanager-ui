//vendor
import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'
import Slider from 'react-slick';
import classNames from 'classNames'
//components
import Loader from 'Components/shared/Loader'
import BaseDetails from './BaseDetails'
//utilites
import environment from 'JS/createRelayEnvironment'


const BaseQuery = graphql`query SelectBaseQuery($first: Int!, $cursor: String){
  availableBases(first: $first, after: $cursor)@connection(key: "SelectBase_availableBases"){
    edges{
      node{
        id
        schema
        repository
        componentId
        revision
        name
        description
        readme
        tags
        icon
        osClass
        osRelease
        license
        url
        languages
        developmentTools
        packageManagers
        dockerImageServer
        dockerImageNamespace
        dockerImageRepository
        dockerImageTag
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

export default class SelectBase extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'name': '',
      'description': '',
      'selectedBase': null,
      'selectedBaseId': false,
      'selectedTab': 'none',
      'viewedBase': null,
      'viewingBase': false
    };

    this._backToBaseSelect = this._backToBaseSelect.bind(this)
  }
  /**
    @param {object} edge
    takes a base image edge
    sets componest state for selectedBaseId and selectedBase
  */
  _selectBase(node){
    this.setState({'selectedBase': node})
    this.setState({'selectedBaseId': node.id})
    this.props.selectBaseCallback(node);
    this.props.toggleDisabledContinue(false);
  }
  /**
    @param {object} edge
    takes a base image edge
    sets componest state for selectedBaseId and selectedBase
  */
  _viewBase(node){
    this.setState({'viewedBase': node})
    this.setState({'viewingBase': true})
  }

  _backToBaseSelect(){
    this.setState({'viewedBase': null})
    this.setState({'viewingBase': false})
  }
  /**
    @param {}
    gets current selectedBase and passes variables to AddEnvironmentComponentMutation
    callback triggers and modal state is changed to  next window
  */
  continueSave(){
    const username = localStorage.getItem('username')
    this.props.toggleDisabledContinue(true);
    this.props.createLabbookMutation()
  }
  /**
    @param {}
    @return {Object} environmentView
  */
  _environmentView(){
    return this.props.environmentView
  }
  /**
    @param {}
    @return {}
  */
  _setSelectedTab(tab){
    this.setState({selectedTab: tab})
  }
  /**
    @param {array} availableBases
    sort bases into a object for easier consumption
    @return {object} sortedBases
  */
  _getTabStructure(availableBases){
      let sortedBases = {tabs:[], bases: {}}
      availableBases.edges.forEach((edge) => {
        let languages = edge.node.languages.join('')
        if(sortedBases.tabs.indexOf(languages) < 0){
          sortedBases.tabs.push(languages)
          sortedBases.bases[languages] = [edge.node]
        }else{
          sortedBases.bases[languages].push(edge.node)
        }
      })

      return sortedBases
  }

  render(){

    let sliderSettings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 2,
      slidesToScroll: 1,
      arrows: true
    };

    return(
      <div className="SelectBase">
        <p className="SelectedBase__modal-header">Create LabBook</p>
        <h4 className="SelectedBase__header"> Select a Base </h4>

        <QueryRenderer
          variables={{
            first: 20
          }}
          query={BaseQuery}
          environment={environment}
          render={({error, props}) =>{

              if(error){

                return(<div>{error.message}</div>)
              }else{

                if(props){
                  const sortedBaseItems = this._getTabStructure(props.availableBases);
                  const selecBaseImage = classNames({
                    'SelectBase__images': true,
                    'SelectBase__images--hidden': (this.state.selectedTab === 'none')
                  })

                  const innerContainer = classNames({
                    'SelectBase__inner-container': true,
                    'SelectBase__inner-container--viewer': this.state.viewingBase
                  })
                  return(
                    <div className={innerContainer}>
                      <div className="SelectBase__select-container">
                        <div className="SelectBase__tabs-container">
                          <ul className="SelectBase__tabs-list">
                            {
                              sortedBaseItems.tabs.map((tab)=>{

                                return(
                                  <LanguageTab
                                    tab={tab}
                                    self={this}
                                />)
                              })
                            }
                          </ul>
                        </div>
                        <div className={selecBaseImage}>
                          <Slider {...sliderSettings}>
                            {
                              (this.state.selectedTab !== 'none') && sortedBaseItems.bases[this.state.selectedTab].map((node) => {

                                  return(
                                    <div className="BaseSlide__wrapper">
                                      <BaseSlide
                                        node={node}
                                        self={this}
                                      />
                                    </div>
                                  )
                              })
                            }
                          </Slider>

                        </div>
                      </div>
                      <div className="SelectBase__viewer-container">
                        <BaseDetails
                          base={this.state.viewedBase}
                          backToBaseSelect={this._backToBaseSelect}
                        />
                      </div>

                    </div>
                  )
                }else{
                  return(<Loader />)
                }
              }
          }}
        />

      </div>
      )
  }
}

/**
* @param {string, this}
* returns tab jsx for
* return {jsx}
*/
const LanguageTab = ({tab, self}) => {
  console.log(self, tab)
  let tabClass = classNames({
    "SelectBase__tab": true,
    "SelectBase__tab--selected": (tab === self.state.selectedTab)
  })
  return(<li
    className={tabClass}
    onClick={()=>self._setSelectedTab(tab)}>
    {tab}
    </li>)
}

/**
* @param {string, this}
* returns base slide
* return {jsx}
*/
const BaseSlide = ({node, self}) =>{

  let selectedBaseImage = classNames({
    'SelectBase__image': true,
    'SelectBase__image--selected': (self.state.selectedBaseId === node.id)
  })
  return(<div
    key={node.id}
    className={"SelectBase__image-wrapper slick-slide"}>
    <div
      className={selectedBaseImage}
      >
      <div className="SelectBase__image-icon">
        <img
          alt=""
          src={node.icon}
          height="50"
          width="50"
        />
      </div>
      <div className="SelectBase__image-text">
        <h6 className="SelectBase__image-header">{node.name}</h6>
        <p>{node.osClass + ' ' + node.osRelease}</p>
        <p className="SelectBase__image-description">{node.description}</p>

        <div className="SelectBase__image-info">
          <div className="SelectBase__image-languages">
            <h6>Languages</h6>
            <ul>
            {
              node.languages.map((language)=>{
                return(<li>{language}</li>)
              })
            }
            </ul>
          </div>
          <div className="SelectBase__image-tools">
            <h6>Tools</h6>
            <ul>
            {
              node.developmentTools.map((tool)=>{
                return(<li>{tool}</li>)
              })
            }
            </ul>
          </div>
        </div>
        <div className="SelectBase__image-actions">
          <button  onClick={()=> self._viewBase(node)} className="flat--button">View Details</button>
          <button  onClick={()=> self._selectBase(node)}>Select</button>
        </div>
      </div>
    </div>
  </div>)
}
