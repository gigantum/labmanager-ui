import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import store from "JS/redux/store";

export default class FileEmpty extends Component {

    render() {
        const {owner, labbookName} = store.getState().routes
        let mainText = this.props.mainText;
        let subText = this.props.subText;
        return(
            <div className="FileEmpty">
                <div className={`FileEmpty__container FileEmpty__container--${this.props.section}`}>

                    <p className="FileEmpty__main-text">{mainText}</p>
                    {!this.props.callback ?
                        <Link
                            className="FileEmpty__sub-text"
                            to={{pathname: `../../../../projects/${owner}/${labbookName}/${this.props.section}`}}
                            replace
                        >
                            {subText}
                        </Link>
                    :
                    <p
                        className="FileEmpty__sub-text"
                        onClick={()=>{this.props.callback()}}
                    >
                        {subText}
                    </p>
                    }
                </div>
            </div>
        )
    }
}
