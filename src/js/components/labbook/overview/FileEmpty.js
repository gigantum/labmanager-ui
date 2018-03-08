import React, { Component } from 'react';
import {Link} from 'react-router-dom';


import store from "JS/redux/store";

import codeSVG from "../../../../images/icons/code.svg";
import inputSVG from "../../../../images/icons/data-input.svg";
import outputSVG from "../../../../images/icons/data-output.svg";

export default class FileEmpty extends Component {

    render() {
        const {owner, labbookName} = store.getState().routes
        let mainText = this.props.mainText;
        let subText = this.props.subText;
        let icon = this.props.icon === 'code' ? codeSVG :
            this.props.icon === 'inputData' ? inputSVG :
            this.props.icon === 'outputData' ? outputSVG : false;
        return(
            <div className="FileEmpty">
                <div className="FileEmpty__container">
                    <img alt="icon" src={icon}/>
                    <p className="FileEmpty__main-text">{mainText}</p>
                    <Link
                        className="FileEmpty__sub-text"
                        to={{pathname: `../../../../labbooks/${owner}/${labbookName}/${this.props.icon}`}}
                        replace
                    >
                        {subText}
                    </Link>
                </div>
            </div>
        )
    }
}