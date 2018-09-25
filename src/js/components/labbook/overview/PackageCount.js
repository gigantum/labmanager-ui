// vendor
import React, { Component } from 'react';
// assets
import './PackageCount.scss';

export default class PackageCount extends Component {
  render() {
    const { overview } = this.props;

    const totalPackageCount = overview.numPipPackages + overview.numAptPackages + overview.numConda2Packages + overview.numConda3Packages;
    return (

      <div className="PackageCount">
        <div className="PackageCount__dependencies">
          <h6 className="Overview__header">Packages</h6>
          <ul className="flex flex--wrap">
            { (overview.numPipPackages > 0) &&
              <li key="numPipPackages" className="PackageCount__item">{`${overview.numPipPackages} pip package(s)` }</li>
            }

            { (overview.numAptPackages > 0) &&
              <li key="numAptPackages" className="PackageCount__item">{`${overview.numAptPackages} apt package(s)` }</li>
            }

            { (overview.numConda2Packages > 0) &&
              <li key="numConda2Packages" className="PackageCount__item">{`${overview.numConda2Packages} conda2 package(s)` }</li>
            }

            { (overview.numConda3Packages > 0) &&
              <li key="numConda3Packages" className="PackageCount__item">{`${overview.numConda3Packages} conda3 package(s)` }</li>
            }

            {
              (totalPackageCount === 0) &&
              <li className="PackageCount__item" key="totalNone">0 pip, apt-get, and conda packages</li>
            }
          </ul>
        </div>
      </div>);
  }
}
