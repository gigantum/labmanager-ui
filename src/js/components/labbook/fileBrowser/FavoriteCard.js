//vendor
import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import classNames from 'classnames'
//Mutations
import RemoveFavoriteMutation from 'Mutations/fileBrowser/RemoveFavoriteMutation'
import UpdateFavoriteMutation from 'Mutations/fileBrowser/UpdateFavoriteMutation'
//store
import store from 'JS/redux/store'


const cardSource = {
	beginDrag(props, monitor, component) {
		return {
			id: props.id,
			index: props.index,
		}
	},
}

const cardTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index
		const hoverIndex = props.index

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return
		}

		// Determine rectangle on screen
		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

		// Determine mouse position
		const clientOffset = monitor.getClientOffset()

		// Get pixels to the top
		const hoverClientY = clientOffset.y - hoverBoundingRect.top

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return
		}

		// Time to actually perform the action
		props.moveCard(dragIndex, hoverIndex)

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex
	},
	drop(props, monitor, component){
		const newIndex = props.index
		component._updateIndexMutation(newIndex)
	}
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
  };
}
function collectDropTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

class FavoriteCard extends Component {
  constructor(props){
  	super(props);

    const {owner, labbookName} = store.getState().routes

    this.state = {
      editMode: false,
      owner,
      labbookName
    }

		this._updateIndexMutation = this._updateIndexMutation.bind(this)
		this._removeFavorite = this._removeFavorite.bind(this)
  }

  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    id: PropTypes.any.isRequired,
    moveCard: PropTypes.func.isRequired,
  }

	/*
		@param {num}
		sets editMode to true or false
		displays textarea if true
	*/
	_updateIndexMutation(newIndex){
		UpdateFavoriteMutation(
			this.props.connection,
			this.props.parentId,
			this.state.owner,
			this.state.labbookName,
			this.props.favorite.id,
			this.props.favorite.key,
			this.props.favorite.description,
			newIndex,
			this.props.favorite,
			this.props.section,
			(response, error)=>{
				if(error){
					console.error(error)
				}
			}
		)
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

    let filepath = favorite.key.replace(this.props.section + '/', '')

    if(evt.keyCode === 13){
        UpdateFavoriteMutation(
          this.props.connection,
          this.props.parentId,
          this.state.owner,
          this.state.labbookName,
          favorite.id,
          filepath,
          evt.target.value,
          favorite.index,
          favorite,
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

  /**
    @param {object} node
    triggers remove favorite mutation
  */
  _removeFavorite(node){

    RemoveFavoriteMutation(
      this.props.connection,
      this.props.parentId,
      this.state.owner,
      this.state.labbookName,
      this.props.section,
      node.key,
      node.id,
			node,
			null,
      (response, error)=>{
        if(error){
          console.error(error)
        }
      }
    )
  }
	/**
    @param {}
    sets description to edit mode on double click
  */
	_handleClickDescription() {
		this._editDescription(true);
	}

  render(){
    let fileDirectories = this.props.favorite.key.split('/');
    let filename = fileDirectories[fileDirectories.length - 1]
    let path = this.props.favorite.key.replace(filename, '')

    const {
	    connectDragSource,
			connectDropTarget
  	} = this.props

		const favoriteCardCSS = classNames({
			'Favorite__card card': (this.props.favorite.index !== undefined),
			'Favorite__card--opaque card': !(this.props.favorite.index !== undefined),
			'column-3-span-4': true
		})
    return(
      connectDragSource(
				connectDropTarget(
	        <div
	          className={favoriteCardCSS}>
	          <div
	            onClick={()=>{ this._removeFavorite(this.props.favorite) }}
	            className="Favorite__star">
	          </div>
						<div className="Favorite__header-section">
	          <h6 className="Favorite__card-header">{filename}</h6>
						</div>

						<div className="Favorite__path-section">
	          	<p className="Favorite__path">{path}</p>
						</div>

	          <div className="Favorite__description-section">

	            { !this.state.editMode && (this.props.favorite.description.length > 0) &&

	                <p className="Favorite__description">{this.props.favorite.description} <button
	                    onClick={()=>this._editDescription(true)}
	                    className="Favorite__edit-button">
	                  </button></p>
	            }

	            { !this.state.editMode && (this.props.favorite.description.length < 1) &&

	                <p
										onDoubleClick={() => this._handleClickDescription()}
										className="Favorite__description-filler">Enter a short description<button
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

	            <div className={(this.props.favorite.index !== undefined) ? 'Favorite__mask hidden' : 'Favorite__mask'}></div>

	          </div>

	        </div>
      )
    )
	)


  }
}
const DropTargetContainer = DropTarget('Card', cardTarget, collectDropTarget)(FavoriteCard);

export default DragSource('Card', cardSource, collect)(DropTargetContainer);
