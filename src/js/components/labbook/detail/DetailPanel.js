// vendor
import React, { Component } from 'react'
//store
import store from 'JS/redux/store'


export default class DetailPanel extends Component {
  constructor(props){
  	super(props);

    this.state = store.getState().detailView
    this._closePanel = this._closePanel.bind(this)
    /*
      subscribe to store to update state
    */

  }

  componentDidMount() {
      store.subscribe(() =>{

        this.storeDidUpdate(store.getState().detailView)
      })
      
      if(this.props.name){
        if(this.state.detailMode && !this.state.previousDetailMode){
          setTimeout(()=>{

              this.refs['DetailPanel'].classList.add('DetailPanel--open')

          },100)
        }else{
          this.refs['DetailPanel'].classList.add('DetailPanel--open')
        }
      }
  }

  componentDidUpdate(prevProps, prevState) {

    if(this.state.detailMode){
      this.refs['DetailPanel'].classList.add('DetailPanel--open')
    }else{
        this.refs['DetailPanel'].classList.remove('DetailPanel--open')
    }

  }

  storeDidUpdate(detailView){
    this.setState(detailView)
  }

  _closePanel(){

    store.dispatch({
      type: 'UPDATE_DETAIL_VIEW',
      payload: {
        detailView: false
      }
    })
  }
  render(){

      return(

        <div
          ref="DetailPanel"
          className="DetailPanel"
        >
          <div
            className="DetailPanel--close"
            onClick={()=> this._closePanel()}
          >
            X
          </div>
          <p>{this.props.name}</p>
          <p>{this.props.key}</p>
          <p>{this.props.extension}</p>
          <p>{this.props.url}</p>
        </div>
      )
  }
}
