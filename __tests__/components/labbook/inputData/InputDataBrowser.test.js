
import React, {Component} from 'react'
import renderer from 'react-test-renderer';
import {mount} from 'enzyme'
import InputDataBrowser from 'Components/labbook/inputData/InputDataBrowser';

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import json from './__relaydata__/InputDataBrowser.json'

import relayTestingUtils from 'relay-testing-utils'
      const loadStatus = ()=>{

      }


      const clearSelectedFiles = ()=>{

      }

      const backend = (manager: Object) => {
          const backend = HTML5Backend(manager),
              orgTopDropCapture = backend.handleTopDropCapture;

          backend.handleTopDropCapture = (e) => {

              if(backend.currentNativeSource){
                orgTopDropCapture.call(backend, e);

               //backend.currentNativeSource.item.dirContent = getFilesFromDragEvent(e, {recursive: true}); //returns a promise
              }
          };

          return backend;
      }

      const fixtures = {
        labbook: json.data.labbook,
        labbookId: json.data.labbook.id,
        isLocked: false,
        selectedFiles: [],
        clearSelectedFiles,
        inputId: json.data.labbook.input.id,
        input: json.data.labbook.input,
        loadStatus
      }

      class InputDataCompInstance extends Component{
        render(){
          return (relayTestingUtils.relayWrap(<InputDataBrowser {...fixtures}/>, {}, json.data.labbook))
        }
      }
      const InputDataBrowserComponent = DragDropContext(backend)(InputDataCompInstance)

      describe('Test CodeBrowser', () => {

        it('snapshot renders', () => {
          const wrapper = renderer.create(
             <InputDataBrowserComponent />
          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })


      })
