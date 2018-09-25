// vendor
import React, { Component, Fragment } from 'react';
// component
import Modal from 'Components/shared/Modal';
// assets
import './ForceMerge.scss';

export default class ForceMerge extends Component {
  /**
  *  @param {}
  *  triggers merge with force set top True
  *  hides modal
  *  @return {}
  */
  _forceMerge(evt) {
    this.props.merge(evt, this.props.params);
    this.props.toggleModal('forceMergeVisible');
  }

  render() {
    return (

      <Modal
        handleClose={() => this.props.toggleModal('forceMergeVisible')}
        header="Force Merge"
        size="medium"
        renderContent={() =>

          (<Fragment>
            <p className="ForceMege__text">Merge failed. Do you want to force merge?</p>

            <div className="ForceMege__buttonContainer">

              <button
                onClick={() => this._forceMerge()}
              >
                Yes
              </button>

              <button
                onClick={() => this.props.toggleModal('forceMergeVisible')}
              >
                No
              </button>

            </div>

           </Fragment>)
        }
      />
    );
  }
}
