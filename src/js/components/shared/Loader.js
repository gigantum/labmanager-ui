import React, { Component } from 'react'

export default class Loader extends Component {

  render() {
    let circleArray = [0,1,2,3,4,5,6,7,8,9,10,11,12]
    return (
      <div className="Loader">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" id="circle-middle">
          <circle fill="#EDEDED" cx="50" cy="50" r="6"/>
        </svg>
        {
          circleArray.map((i) => {
            return(
              <svg key={'circle_' + i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <circle fill="#26A6D1" cx="50" cy="50" r="4.5"/>
              </svg>)
          })

        }
      </div>

    )
  }
}
