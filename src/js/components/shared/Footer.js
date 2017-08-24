import React, { Component } from 'react'

export default class Footer extends Component {

  componentDidMount() {
    window.addEventListener('scroll', function(e){
      console.log(e)
      var root = document.getElementById('root')
      var distanceY = window.innerHeight + document.body.scrollTop + 20,
          shrinkOn = root.offsetHeight,
          footer = document.getElementById("footer");

      console.log(distanceY, shrinkOn)
      if (distanceY > shrinkOn) {
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
