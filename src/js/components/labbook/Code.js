// import 'es6-promise';
import React, { Component } from 'react'
import Display from '@nteract/display-area'
import example from './example.ipynb'
console.log(example)
// import {
//   Session, ServerConnection, Config
// } from '@jupyterlab/services';
//
// console.log(Session, ServerConnection, Config)
// function log(text: string): void {
//   let el = document.getElementById('code');
//   //el.textContent = el.textContent + '\n' + text;
//   console.log(text);
// }
//
// function main() {
//   // Start a new session.
//
//   let options = Session.IOptions = {
//     kernelName: 'python',
//     path: './example.ipynb',
//     baseUrl: 'http://localhost:8888/'
//   };
//   let session = Session.ISession;
//   let settings = ServerConnection.makeSettings(options)
//   settings.path =  './example.ipynb';
//   console.log(settings, options)
//   Session.startNew(settings).then(s => {
//     log('Session started', s);
//     session = s;
//     // Rename the session.
//     return session.rename('bar.ipynb');
//   }).then(() => {
//     log(`Session renamed to ${session.path}`);
//     // Execute and handle replies on the kernel.
//     let future = session.kernel.requestExecute({ code: 'a = 1' });
//     future.onReply = (reply) => {
//       log('Got execute reply');
//     };
//     future.onDone = () => {
//       log('Future is fulfilled');
//       // Shut down the session.
//       session.shutdown().then(() => {
//         log('Session shut down');
//         log('Test Complete!');
//       });
//     };
//   }).catch(err => {
//     console.error(err);
//     log('Test Failed! See the console output for details');
//   });
// }
//
// window.onload = main;


export default class Code extends Component {
  constructor(props){
  	super(props);
  }

  render(){

    return(
        <div id="code" className="code__container flex flex-row justify-center">
          <a className="btn btn-secondary" href="http://localhost:8888/notebooks/example.ipynb"
          target="_blank">
            Open Jupyter
          </a>
        </div>
      )
  }
}
