//vendor
import React, {Component} from 'react';

export default class ForceMerge extends Component {
  /**
  *  @param {}
  *  triggers merge with force set top True
  *  hides modal
  *  @return {}
  */
  _forceMerge(evt){
    this.props.merge(evt, this.props.params);
    this.props.toggleModal('forceMergeVisible')
  }

  render() {


      return (
        <div
          key="ForceMege"
          className="ForceMege">
            <div
              onClick={() => this.props.toggleModal('forceMergeVisible')}
              className="ForceMege__close"></div>
            <h4 className="ForceMege__header">Force Merge</h4>
            <p className="ForceMege__text">Merge failed. Do you want to force merge?</p>
            <div className="ForceMege__button-container">
              <button
                onClick={() => this._forceMerge()}>
                Yes
              </button>
              <button
                onClick={() => this.props.toggleModal('forceMergeVisible')}>
                No
              </button>
            </div>
        </div>)
        }
      }
