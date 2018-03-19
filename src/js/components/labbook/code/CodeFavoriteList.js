// vendor
import React, { Component } from 'react'
import PropTypes from 'prop-types'
//componenets
import FavoriteCard from './../fileBrowser/FavoriteCard'
//store
import store from 'JS/redux/store'

class CodeFavoriteList extends Component {
  constructor(props){
  	super(props);
    this.state = {
      loading: false,
      favorites: this.props.favorites
    }

    this.moveCard = this.moveCard.bind(this)

  }

  componentWillReceiveProps(nextProps) {
    let favorites = this.state.favorites;
    let newFavorites = [];
    let nextPropsFavorites = nextProps.favorites

    let favoritesIds = []
    let nextPropsFavoritesIds = []

    nextPropsFavorites.forEach((fav)=>{
      nextPropsFavoritesIds.push(fav.node.id)
    })

    favorites.forEach((fav)=>{
      favoritesIds.push(fav.node.id)

      if(nextPropsFavoritesIds.indexOf(fav.node.id) > -1){
        let favorite = nextPropsFavorites[nextPropsFavoritesIds.indexOf(fav.node.id)]
        newFavorites.push(favorite)
      }
    })

    nextPropsFavorites.forEach((fav)=>{
      if(favoritesIds.indexOf(fav.node.id) === -1){
        newFavorites.push(fav)
      }
    })

    this.setState({favorites: newFavorites})
  }

  moveCard(dragIndex, hoverIndex) {
    const { favorites } = this.state
    let newFavoritesList = this._arrayMove(favorites, dragIndex, hoverIndex)

    this.setState({favorites: newFavoritesList})
  }

  _arrayMove(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
        var k = newIndex - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  };


  render(){
    const {
      favorites
    } = this.state
    if (favorites) {
      return(
        <div className="Favorite__list">
          {
            favorites.map((edge, index)=>{
              return(
                <FavoriteCard
                  key={edge.node.key}
                  id={edge.node.id}
                  index={index}
                  labbookName={this.props.labbookName}
                  parentId={this.props.codeId}
                  section={'code'}
                  connection={"CodeFavorites_favorites"}
                  favorite={edge.node}
                  owner={this.props.owner}
                  moveCard={this.moveCard}
                />)
            })
          }
        </div>
      )
    } else {
      return(
        <div className="Favorite__list">
            <div className="Favorite__card-wrapper" draggable="true">
                <div className="Favorite__card card">
                    <div className="Favorite__star"></div>
                    <div className="Favorite__header-section">
                        <h6 className="Favorite__card-header"></h6>
                    </div>
                    <div className="Favorite__path-section">
                        <p className="Favorite__path"></p>
                    </div>
                    <div className="Favorite__description-section">
                        <p className="Favorite__description">
                        <button className="Favorite__edit-button"></button></p>
                        <div className="Favorite__mask hidden"></div>
                    </div>
                </div>
            </div>
            <div className="Favorite__card-wrapper" draggable="true">
                <div className="Favorite__card card">
                    <div className="Favorite__star"></div>
                    <div className="Favorite__header-section">
                        <h6 className="Favorite__card-header"></h6>
                    </div>
                    <div className="Favorite__path-section">
                        <p className="Favorite__path"></p>
                    </div>
                    <div className="Favorite__description-section">
                        <p className="Favorite__description">
                        <button className="Favorite__edit-button"></button></p>
                        <div className="Favorite__mask hidden"></div>
                    </div>
                </div>
            </div>
        </div>
      )
    }


  }
}

export default CodeFavoriteList
