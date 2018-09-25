/*
  This is a multi-use panel for a labbook
  File information and activty details are explored here
*/
// vendor
import { connect } from 'react-redux';
import React, { Component } from 'react';
// store
import { setUpdateDetailView } from 'JS/redux/reducers/labbook/labbook';

class DetailPanel extends Component {
  constructor(props) {
  	super(props);

    // bind functions here
    this._closePanel = this._closePanel.bind(this);
  }

  /*
    sets unsubcribe method,
    subscribes to redux store
    opens panel with or without transitions depeneding on components state
  */
  componentDidMount() {
    if (this.props.name) {
      if (this.props.detailMode && !this.props.previousDetailMode && this.refs.DetailPanel) {
        setTimeout(() => {
          this.refs.DetailPanel.classList.add('DetailPanel--open');
        }, 100);
      } else if (this.refs.DetailPanel) {
        this.refs.DetailPanel.classList.add('DetailPanel--open');
      }
    }
  }
  /*
    opens or closes the detail panel
  */
  componentDidUpdate(prevProps, prevState) {
    if (this.refs.DetailPanel) {
      if (this.props.detailMode) {
        this.refs.DetailPanel.classList.add('DetailPanel--open');
      } else {
        this.refs.DetailPanel.classList.remove('DetailPanel--open');
      }
    }
  }

  /*
    updates redux store to close detail panel
  */
  _closePanel() {
    setUpdateDetailView(false);
  }
  render() {
    // added hidden to className to prevent dialogue from showing until this feature is fully implemented
    return (

      <div
        ref="DetailPanel"
        className="DetailPanel hidden"
      >
        <div
          className="DetailPanel--close"
          onClick={() => this._closePanel()}
        >
            X
        </div>

        <p>{this.props.name}</p>

        <p>{this.props.extension}</p>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => state.detailView;

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(DetailPanel);
