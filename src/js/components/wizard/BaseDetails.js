import React from 'react'

export default class BaseDetails extends React.Component {
  constructor(props){
    super(props)

  }
  
  render(){
    const {base} = this.props
    if(base){

    return(
      <div className="BaseDetails">
        <div className="BaseDetails__button">
          <button
            onClick={()=> this.props.backToBaseSelect()}
            className="flat--button">
            Back To Select A Base
          </button>
        </div>
        <div className="BaseDetails__base">

          <div className="Base__image-details">
            <img
              alt=""
              src={base.icon}
              height="50"
              width="50"
            />
            <div>
              <h6 className="Base__image-header">{base.name}</h6>
              <p>{base.osClass + ' ' + base.osRelease}</p>
            </div>
          </div>
          <div className="Base__image-text">

            <p>{base.osClass + ' ' + base.osRelease}</p>
            <p className="Base__image-description">{base.description}</p>

            <div className="Base__image-info">
              <div className="Base__image-languages">
                <h6>Languages</h6>
                <ul>
                {
                  base.languages.map((language)=>{
                    return(<li>{language}</li>)
                  })
                }
                </ul>
              </div>
              <div className="Base__image-tools">
                <h6>Tools</h6>
                <ul>
                {
                  base.developmentTools.map((tool)=>{
                    return(<li>{tool}</li>)
                  })
                }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      )
    }else{
      return(
        <div className="BaseDetails__loading">

        </div>
      )
    }
  }
}
