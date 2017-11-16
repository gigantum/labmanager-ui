//vendor
import React, { Component } from 'react'
//Mutations
import AddFavoriteMutation from 'Mutations/AddFavoriteMutation'
import RemoveFavoriteMutation from 'Mutations/RemoveFavoriteMutation'

export default class FavoriteCard extends Component {
  constructor(props){
  	super(props);

    this.state = {
      editMode: false
    }
  }

  _editDescription(value){
    this.setState({editMode: value})
  }

  _updateDescription(evt, key){
    const username = localStorage.getItem('username')
    let filepath = key.replace(this.props.root + '/', '')

    if(evt.keyCode === 13){
        AddFavoriteMutation(
          this.props.connection,
          this.props.parentId,
          username,
          this.props.labbookName,
          this.props.root,
          filepath,
          evt.target.value,
          false,
          0,
          (response, error)=>{
            if(error){
              console.error(error)
            }
          }
        )
        this._editDescription(false)
    }

  }

  _unfavorite(node){

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
          onClick={()=>{ this._unfavorite(this.props.favorite) }}
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
              onKeyDown={(evt)=>this._updateDescription(evt, this.props.favorite.key)}
              placeholder={this.props.favorite.description}>
              {this.props.favorite.description}
            </textarea>

          }


        </div>
      </div>
    )
  }
}
