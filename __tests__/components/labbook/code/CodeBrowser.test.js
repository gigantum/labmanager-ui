
      import React, {Component} from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CodeBrowser from 'Components/labbook/code/CodeBrowser';

      import { DragDropContext } from 'react-dnd'
      import HTML5Backend from 'react-dnd-html5-backend'

      import json from './__relaydata__/CodeBrowser.json'

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
        codeId: json.data.labbook.code.id,
        code: json.data.labbook.code,
        loadStatus
      }

      class CodeCompInstance extends Component{
        render(){
          return (relayTestingUtils.relayWrap(<CodeBrowser {...fixtures}/>, {}, json.data.labbook))
        }
      }
      const CodeBrowserComponent = DragDropContext(backend)(CodeCompInstance)

      describe('Test CodeBrowser', () => {

        it('snapshot renders', () => {
          const wrapper = renderer.create(
             <CodeBrowserComponent />
          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })


      })
