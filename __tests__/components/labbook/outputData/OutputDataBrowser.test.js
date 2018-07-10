
import React, {Component} from 'react'
import renderer from 'react-test-renderer';
import {mount} from 'enzyme'
import OutputDataBrowser from 'Components/labbook/outputData/OutputDataBrowser';

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import json from './__relaydata__/OutputDataBrowser.json'

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
        outputId: json.data.labbook.output.id,
        output: json.data.labbook.output,
        loadStatus
      }

      class OutputDataCompInstance extends Component{
        render(){
          return (relayTestingUtils.relayWrap(<OutputDataBrowser {...fixtures}/>, {}, json.data.labbook))
        }
      }
      const OutputDataBrowserComponent = DragDropContext(backend)(OutputDataCompInstance)

      describe('Test CodeBrowser', () => {

        it('snapshot renders', () => {
          const wrapper = renderer.create(
             <OutputDataBrowserComponent />
          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })


      })
