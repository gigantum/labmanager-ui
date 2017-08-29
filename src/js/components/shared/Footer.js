import React, { Component } from 'react'

export default class Footer extends Component {

  componentDidMount() {

    //adds a class to the footer element to expand when the user scolls to the bottom of the screen
    window.addEventListener('scroll', function(e){
      let root = document.getElementById('root')
      let distanceY = window.innerHeight + document.body.scrollTop + 20,
          expandOn = root.offsetHeight,
          footer = document.getElementById("footer");

      if (distanceY > expandOn) {
          footer.classList.add("Footer__expand");
      } else {
          if (footer.classList.contains("Footer__expand")) {
                footer.classList.remove("Footer__expand");
            }
        }
    });
  }
  render() {
    return (
      <div id="footer" className={'Footer flex flex--row justify--space-between'}>

      </div>
    )
  }
}