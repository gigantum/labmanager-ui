// vendor
import React, { Component } from 'react'
//componenets
import RecentCard from './RecentCard'
//store
import store from 'JS/redux/store'

export default class MostRecentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortedFiles: this.props.allFiles,
      loading: false,
      showAmount: this.props.showAmount,
      shownFiles: []
    }
  }

  componentDidMount() {
    this.setState({ shownFiles: this.state.sortedFiles.slice(0, this.state.showAmount) });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ shownFiles: nextProps.allFiles.slice(0, nextProps.showAmount) });

  }

  render() {
    const {
      shownFiles
    } = this.state
    let pathArray = store.getState().routes.callbackRoute.split('/')
    let selectedPath = (pathArray.length > 4) ? pathArray[pathArray.length - 1] : 'overview'
    if (selectedPath === 'inputData' || selectedPath === 'outputData') {
      selectedPath = selectedPath.substring(0, selectedPath.length - 4);
    }
    let favoriteConnection = selectedPath === 'code' ? 'CodeFavorites_favorites' :
      selectedPath === 'input' ? 'InputFavorites_favorites' :
        'OutputFavorites_favorites';
    let connection = selectedPath === 'code' ? 'MostRecentCode_allFiles' :
      selectedPath === 'input' ? 'MostRecentInput_allFiles' :
        'MostRecentOutput_allFiles'
    return (
      <div className="Recent__list">
        {
          shownFiles.map((edge, index) => {
            return (
              <RecentCard
                key={edge.node.key}
                id={edge.node.id}
                index={index}
                labbookName={this.props.labbookName}
                parentId={this.props.edgeId}
                section={selectedPath}
                connection={connection}
                favoriteConnection={favoriteConnection}
                file={edge}
                owner={this.props.owner}
              />
            )
          })
        }
      </div>
    )

  }
}