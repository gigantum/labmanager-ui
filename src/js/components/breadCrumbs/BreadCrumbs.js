import React, { Component } from 'react'

export default class BreadCrumbs extends Component {
  constructor(props){
  	super(props);

    let paths = this._getPaths(props)
    this.state = {
      breadCrumbs: paths
    }
  }

  componentWillReceiveProps(nextProps) {

    let paths = this._getPaths(nextProps)
    this.setState({
      breadCrumbs: paths
    })
  }
  /*
      functions(object): takes props
      returns(array)  route array ['labboks', ${labbook_name}]
  */
  _getPaths(props){
    let paths = props.location.location.pathname.split('/')
    paths.shift()
    return paths;
  }
  /*
      functions(string): takes breadcrumb string
      reroutes application to breadcrumb route
  */
  _reroute(bc){
      let index = this.state.breadCrumbs.indexOf(bc)

      if(this.state.breadCrumbs.length > (index+1)){

        let subArray = this.state.breadCrumbs.slice(0, index + 1)

        this.props.history.replace('/' + subArray.join('/')) //route to
      }
  }
  /*
    function(string): takes breadcrumb string
    returns  jsx of BreadCrumbs__list-item
  */
  _breadCrumb(bc){

    return (<li className="BreadCrumbs__list-item" key={bc} onClick={()=> this._reroute(bc)}>{bc}</li>)
  }

  render(){

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
