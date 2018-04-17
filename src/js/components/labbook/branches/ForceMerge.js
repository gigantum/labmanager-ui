//vendor
import React from 'react';
//store
import store from 'JS/redux/store'

export default class CreateBranchModal extends React.Component {
  /**
  *  @param {}
  *  triggers merge with force set top True
  *  hides modal
  *  @return {}
  */
  _forceMerge(){
    this.props.merge(true);
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
