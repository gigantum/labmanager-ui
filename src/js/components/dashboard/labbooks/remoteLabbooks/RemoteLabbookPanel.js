// vendor
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import Highlighter from 'react-highlight-words';
import classNames from 'classnames';
// muations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation';
import BuildImageMutation from 'Mutations/BuildImageMutation';
// store
import store from 'JS/redux/store';
import { setWarningMessage, setMultiInfoMessage } from 'JS/redux/reducers/footer';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// components
import LoginPrompt from 'Components/labbook/labbookHeader/branchMenu/modals/LoginPrompt';
import Loader from 'Components/shared/Loader';
// assets
import './RemoteLabbookPanel.scss';

export default class RemoteLabbookPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labbookName: props.edge.node.name,
      owner: props.edge.node.owner,
      isImporting: false,
      showLoginPrompt: false,
    };
    this._importingState = this._importingState.bind(this);
    this._clearState = this._clearState.bind(this);
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
  }

  /**
    * @param {object} edge
    * validates user's session and then triggers toggleDeleteModal which passes parameters to the DeleteLabbook component
  */
  _handleDelete(edge) {
    if (localStorage.getItem('username') !== edge.node.owner) {
      setWarningMessage('You can only delete remote Projects that you have created.');
    } else {
      UserIdentity.getUserIdentity().then((response) => {
        if (navigator.onLine) {
          if (response.data) {
            if (response.data.userIdentity.isSessionValid) {
              this.props.toggleDeleteModal({
                remoteId: edge.node.id, remoteOwner: edge.node.owner, remoteLabbookName: edge.node.name, existsLocally: this.props.existsLocally,
              });
            } else {
              this.props.auth.renewToken(true, () => {
                this.setState({ showLoginPrompt: true });
              }, () => {
                this.props.toggleDeleteModal({
                  remoteId: edge.node.id, remoteOwner: edge.node.owner, remoteLabbookName: edge.node.name, existsLocally: this.props.existsLocally,
                });
              });
            }
          }
        } else {
          this.setState({ showLoginPrompt: true });
        }
      });
    }
  }

  /**
    * @param {}
    * fires when user identity returns invalid session
    * prompts user to revalidate their session
  */
  _closeLoginPromptModal() {
    this.setState({
      showLoginPrompt: false,
    });
  }

  /**
    *  @param {}
    *  changes state of isImporting to false
  */
  _clearState = () => {
    this.setState({
      isImporting: false,
    });
  }
  /**
    *  @param {}
    *  changes state of isImporting to true
  */
  _importingState = () => {
    this.setState({
      isImporting: true,
    });
  }

  /**
    *  @param {owner, labbookName}
    *  imports labbook from remote url, builds the image, and redirects to imported labbook
    *  @return {}
  */
 importLabbook = (owner, labbookName) => {
   const self = this;
   const id = uuidv4();
   const remote = `https://repo.gigantum.io/${owner}/${labbookName}`;

   UserIdentity.getUserIdentity().then((response) => {
     if (navigator.onLine) {
       if (response.data) {
         if (response.data.userIdentity.isSessionValid) {
           this._importingState();
           setMultiInfoMessage(id, 'Importing Project please wait', false, false);
           ImportRemoteLabbookMutation(
             owner,
             labbookName,
             remote,
             (response, error) => {
               this._clearState();

               if (error) {
                 console.error(error);
                 setMultiInfoMessage(id, 'ERROR: Could not import remote Project', null, true, error);
               } else if (response) {
                 const labbookName = response.importRemoteLabbook.newLabbookEdge.node.name;
                 const owner = response.importRemoteLabbook.newLabbookEdge.node.owner;
                 setMultiInfoMessage(id, `Successfully imported remote Project ${labbookName}`, true, false);


                 BuildImageMutation(
                   labbookName,
                   owner,
                   false,
                   (response, error) => {
                     if (error) {
                       console.error(error);
                       setMultiInfoMessage(id, `ERROR: Failed to build ${labbookName}`, null, true, error);
                     }
                   },
                 );

                 self.props.history.replace(`/projects/${owner}/${labbookName}`);
               } else {
                 BuildImageMutation(
                   labbookName,
                   localStorage.getItem('username'),
                   false,
                   (error) => {
                     if (error) {
                       console.error(error);
                       setMultiInfoMessage(id, `ERROR: Failed to build ${labbookName}`, null, true, error);
                     }
                   },
                 );
               }
             },
           );
         } else {
           this.props.auth.renewToken(true, () => {
             this.setState({ showLoginPrompt: true });
           }, () => {
             this.importLabbook(owner, labbookName);
           });
         }
       }
     } else {
       this.setState({ showLoginPrompt: true });
     }
   });
 }

 render() {
   const edge = this.props.edge;

   const descriptionCss = classNames({
     'RemoteLabbooks__row RemoteLabbooks__row--text': true,
     blur: this.state.isImporting,
   });

   const deleteCSS = classNames({
     RemoteLabbooks__icon: true,
     'RemoteLabbooks__icon--delete': localStorage.getItem('username') === edge.node.owner,
     'RemoteLabbooks__icon--delete-disabled': localStorage.getItem('username') !== edge.node.owner,
   });

   return (
     <div
       key={edge.node.name}
       className="Card column-4-span-3 flex flex--column justify--space-between"
     >
       {

        }
       <div className="RemoteLabbooks__row RemoteLabbooks__row--icon">
         {
          this.props.existsLocally ?
            <button
              className="RemoteLabbooks__icon RemoteLabbooks__icon--cloud"
              disabled
            />
          :
            <button
              disabled={this.state.isImporting}
              className="RemoteLabbooks__icon RemoteLabbooks__icon--cloud-download"
              onClick={() => this.importLabbook(edge.node.owner, edge.node.name)}
            />
        }
         <button
           className={deleteCSS}
           disabled={this.state.isImporting}
           onClick={() => this._handleDelete(edge)}
         />
       </div>

       <div className={descriptionCss}>

         <div className="RemoteLabbooks__row RemoteLabbooks__row--title">
           <h6
             className="RemoteLabbooks__panel-title"
           >
             <Highlighter
               highlightClassName="LocalLabbooks__highlighted"
               searchWords={[store.getState().labbookListing.filterText]}
               autoEscape={false}
               caseSensitive={false}
               textToHighlight={edge.node.name}
             />
           </h6>

         </div>

         <p className="RemoteLabbooks__paragraph RemoteLabbooks__paragraph--owner">{`Created by ${edge.node.owner}`}</p>

         <p
           className="RemoteLabbooks__paragraph RemoteLabbooks__paragraph--description"
         >
           <Highlighter
             highlightClassName="LocalLabbooks__highlighted"
             searchWords={[store.getState().labbookListing.filterText]}
             autoEscape={false}
             caseSensitive={false}
             textToHighlight={edge.node.description}
           />
         </p>
       </div>
       { !(edge.node.visibility === 'local') &&
       <div data-tooltip={`${edge.node.visibility}`} className={`Tooltip RemoteLabbooks__${edge.node.visibility}`} />
        }
       {
          this.state.isImporting &&
          <div className="RemoteLabbooks__loader">
            <Loader />
          </div>
        }

       {
          this.state.showLoginPrompt &&
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        }
     </div>);
 }
}
