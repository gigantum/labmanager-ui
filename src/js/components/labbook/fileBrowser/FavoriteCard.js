//vendor
import React, { Component } from 'react'
//Mutations
import AddFavoriteMutation from 'Mutations/AddFavoriteMutation'
import RemoveFavoriteMutation from 'Mutations/RemoveFavoriteMutation'
import UpdateFavoriteMutation from 'Mutations/UpdateFavoriteMutation'

export default class FavoriteCard extends Component {
  constructor(props){
  	super(props);

    this.state = {
      editMode: false
    }
  }

  /*
    @param {boolean} value
    sets editMode to true or false
    displays textarea if true
  */
  _editDescription(value){
    this.setState({editMode: value})
  }
  /*
    @param {event, string} evt,key
    triggers add favorite mutation on key ENTER
    hides editMode
  */
  _updateDescription(evt, favorite){
    const username = localStorage.getItem('username')
    let filepath = favorite.key.replace(this.props.section + '/', '')

    if(evt.keyCode === 13){
        UpdateFavoriteMutation(
          this.props.connection,
          this.props.parentId,
          username,
          this.props.labbookName,
          filepath,
          evt.target.value,
          favorite.index,
          favorite.index,
          this.props.section,
          (response, error)=>{
            if(error){
              console.error(error)
            }
          }
        )
        this._editDescription(false)
    }

  }

  /*
    @param {object} node
    triggers remove favorite mutation
  */
  _removeFavorite(node){

    const username = localStorage.getItem('username')
    RemoveFavoriteMutation(
      this.props.connection,
      this.props.parentId,
      username,
      this.props.labbookName,
      this.props.root,
      node.index,
      node.id,
      (response, error)=>{
        if(error){
          console.error(error)
        }
      }
    )
  }

  render(){
    let fileDirectories = this.props.favorite.key.split('/');
    let filename = fileDirectories[fileDirectories.length - 1]
    let path = this.props.favorite.key.replace(filename, '')

    return(
      <div className="Favorite__card card">
        <div
          onClick={()=>{ this._removeFavorite(this.props.favorite) }}
          className="Favorite__star">
        </div>

        <h6 className="Favorite__card-header">{filename}</h6>

        <p className="Favorite__path">{path}</p>

        <div className="Favorite__description-section">

          { !this.state.editMode && (this.props.favorite.description.length > 0) &&

              <p className="Favorite__description">{this.props.favorite.description} <button
                  onClick={()=>this._editDescription(true)}
                  className="Favorite__edit-button">
                </button></p>
          }

          { !this.state.editMode && (this.props.favorite.description.length < 1) &&

              <p className="Favorite__description-filler">Enter a short description<button
                  onClick={()=>this._editDescription(true)}
                  className="Favorite__edit-button">
              </button></p>
          }

          {
            this.state.editMode &&
            <textarea
              className="Favorite__description-editor"
              onKeyDown={(evt)=>this._updateDescription(evt, this.props.favorite)}
              placeholder={this.props.favorite.description}>
              {this.props.favorite.description}
            </textarea>
          }

        </div>

      </div>
    )
  }
}
