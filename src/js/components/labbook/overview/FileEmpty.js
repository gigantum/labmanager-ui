import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import store from "JS/redux/store";

export default class FileEmpty extends Component {

    render() {
        const {owner, labbookName} = store.getState().routes
        let mainText = this.props.mainText;
        let subText = this.props.subText;
        console.log(this.props)
        return(
            <div className="FileEmpty">
                <div className={`FileEmpty__container FileEmpty__container--${this.props.section}`}>

                    <p className="FileEmpty__main-text">{mainText}</p>
                    <Link
                        className="FileEmpty__sub-text"
                        to={{pathname: `../../../../labbooks/${owner}/${labbookName}/${this.props.section}`}}
                        replace
                    >
                        {subText}
                    </Link>
                </div>
            </div>
        )
    }
}
