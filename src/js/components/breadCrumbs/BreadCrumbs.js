import React, { Component } from 'react'

export default class BreadCrumbs extends Component {
  constructor(props){
  	super(props);

    let paths = props.location.location.pathname.split('/')
    paths.shift()
    this.state = {
      breadCrumbs: paths
    }
  }

  componentWillReceiveProps(nextProps) {

    let paths = nextProps.location.location.pathname.split('/')
    paths.shift()
    this.setState({
      breadCrumbs: paths
    })
  }

  _reroute(bc){
      let index = this.state.breadCrumbs.indexOf(bc)
      let subArray = this.state.breadCrumbs.slice(0, index + 1)

      this.props.history.replace('/' + subArray.join('/')) //route to
  }

  _breadCrumb(bc){

    return (<li className="BreadCrumbs__list-item" key={bc} onClick={()=> this._reroute(bc)}>{bc}</li>)
  }

  render(){
    console.log(this.state)
    return(
        <div className="BreadCrumbs">
          <ul className="BreadCrumbs__list flex flex--row">
            {this.state.breadCrumbs.map((bc) => {
              return(this._breadCrumb(bc))
            })}
          </ul>
        </div>
      )
  }
}
