// vendor
import React, { Component } from 'react';
// componenets
import FavoriteCard from './../fileBrowser/FavoriteCard';

class InputFavoriteList extends Component {
  constructor(props) {
  	super(props);
    this.state = {
      loading: false,
      favorites: this.props.favorites,
    };

    this.moveCard = this.moveCard.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const favorites = this.state.favorites;
    const newFavorites = [];
    const nextPropsFavorites = nextProps.favorites;

    const favoritesIds = [];
    const nextPropsFavoritesIds = [];

    nextPropsFavorites.forEach((fav) => {
      nextPropsFavoritesIds.push(fav.node.id);
    });

    favorites.forEach((fav) => {
      favoritesIds.push(fav.node.id);

      if (nextPropsFavoritesIds.indexOf(fav.node.id) > -1) {
        const favorite = nextPropsFavorites[nextPropsFavoritesIds.indexOf(fav.node.id)];
        newFavorites.push(favorite);
      }
    });

    nextPropsFavorites.forEach((fav) => {
      if (favoritesIds.indexOf(fav.node.id) === -1) {
        newFavorites.push(fav);
      }
    });

    this.setState({ favorites: newFavorites });
  }

  moveCard(dragIndex, hoverIndex) {
    const { favorites } = this.state;
    const newFavoritesList = this._arrayMove(favorites, dragIndex, hoverIndex);

    this.setState({ favorites: newFavoritesList });
  }

  _arrayMove(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  }


  render() {
    const {
      favorites,
    } = this.state;

    return (

      <div className="Favorite__list grid">
        {
          favorites.map((edge, index) => (

            <FavoriteCard
              key={edge.node.key}
              id={edge.node.id}
              index={index}
              labbookName={this.props.labbookName}
              parentId={this.props.inputId}
              section="input"
              connection="InputFavorites_favorites"
              favorite={edge.node}
              owner={this.props.owner}
              moveCard={this.moveCard}
            />))
        }
      </div>
    );
  }
}

export default InputFavoriteList;
