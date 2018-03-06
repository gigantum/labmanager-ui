/*
  This is a multi-use panel for a labbook
  File information and activty details are explored here
*/
// vendor
import React, { Component } from 'react'
//store
import store from 'JS/redux/store'

let unsubscribe;
export default class DetailPanel extends Component {
  constructor(props){
  	super(props);
    //sets state to store
    this.state = store.getState().detailView

    //bind functions here
    this._closePanel = this._closePanel.bind(this)
  }

  /*
    sets unsubcribe method,
    subscribes to redux store
    opens panel with or without transitions depeneding on components state
  */
  componentDidMount() {
      unsubscribe = store.subscribe(() =>{
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
  /*
    must unsubscribe from the store on unmount
  */
  componentWillUnmount() {
    unsubscribe()
  }
  /*
    opens or closes the detail panel
  */
  componentDidUpdate(prevProps, prevState) {

    if(this.state.detailMode){
      this.refs['DetailPanel'].classList.add('DetailPanel--open')
    }else{
        this.refs['DetailPanel'].classList.remove('DetailPanel--open')
    }

  }

  /*
    updates state if and only of state is different from the store
  */
  storeDidUpdate(detailView){
    if(JSON.stringify(this.state) !== JSON.stringify(detailView)){
      this.setState(detailView)
    }
  }

  /*
    updates redux store to close detail panel
  */
  _closePanel(){

    store.dispatch({
      type: 'UPDATE_DETAIL_VIEW',
      payload: {
        detailMode: false
      }
    })

  }
  render(){
      //added hidden to className to prevent dialogue from showing until this feature is fully implemented
      return(

        <div
          ref="DetailPanel"
          className="DetailPanel hidden">
          <div
            className="DetailPanel--close"
            onClick={()=> this._closePanel()}>
            X
          </div>

          <p>{this.props.name}</p>

          <p>{this.props.extension}</p>

        </div>
      )
  }
}
