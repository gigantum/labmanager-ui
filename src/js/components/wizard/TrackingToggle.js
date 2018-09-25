import React from 'react';
import classNames from 'classnames';

export default class BaseDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTrackingOn: true,
    };
  }

  _toggleTrackingState() {
    this.setState({ isTrackingOn: !this.state.isTrackingOn });

    this.props.setTracking(!this.state.isTrackingOn);
  }

  render() {
    const toggleCondition = classNames({
      TrackingToggle__label: true,
      'TrackingToggle__label--on': this.state.isTrackingOn,
      'TrackingToggle__label--off': !this.state.isTrackingOn,
    });

    const toggleCheckboxCondition = classNames({
      TrackingToggle__checkbox: true,
      'TrackingToggle__checkbox--on': this.state.isTrackingOn,
      'TrackingToggle__checkbox--off': !this.state.isTrackingOn,
    });

    const trackingState = this.state.isTrackingOn ? 'Enabled' : 'Disabled';
    return (
      <div className="TrackingToggle">
        <div className="TrackingToggle__text">Input/Output Version Tracking {trackingState}</div>
        <span className={toggleCheckboxCondition}>

          <input
            data-on="&#x2714;"
            data-off="&#x2718;"
            onClick={() => this._toggleTrackingState()}
            id="TrackingToggle__input"
            className="TrackingToggle__input"
            type="checkbox"
            defaultChecked={this.state.isTrackingOn}
          />
          <label
            className={toggleCondition}
            htmlFor="TrackingToggle__input"
          />
        </span>
      </div>
    );
  }
}
