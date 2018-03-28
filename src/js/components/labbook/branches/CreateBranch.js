// //vendor
// import React from 'react';
// import classNames from 'classnames';



// export default class CreateBranchModal extends React.Component {
//     constructor(props){
//         super(props);
//         this.state = {

//         };
//     }
//     render() {
//         return(
//             <div className={wizardModalNav}>
//             <div>
//               <button
//                 onClick={() => {setComponent('createLabbook')}}
//                 className={backButton}>
//                 Back
//               </button>
//               <div className={trackingButton}>
//                 <TrackingToggle
//                   setTracking={self._setTracking}
//                 />
//               </div>
//             </div>
//             <div className="WizardModal__nav-group">
//               <button
//                 onClick={() => {hideModal()}}
//                 className="WizardModal__progress-button button--flat">
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {continueSave(false, _getButtonText(state))}}
//                 disabled={(state.continueDisabled)}
//                 >
//                   {
//                     _getButtonText(state)
//                   }
//               </button>
//             </div>
//           </div>
//         )
//     }
// }