
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CodeBrowser from 'Components/labbook/code/CodeBrowser';

<<<<<<< HEAD
      import relayTestingUtils from 'relay-testing-utils'

      test('Test CodeBrowser', () => {

        const wrapper = renderer.create(

           <CodeBrowser />
=======
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

      test('Test CodeBrowser', () => {
        const RelayWrap = relayTestingUtils.relayWrap(<CodeBrowser {...fixtures}/>, {}, json.data.labbook)
        const CodeComp = DragDropContext(backend)(<RelayWrap />)
        const wrapper = renderer.create(

           <CodeComp />
>>>>>>> batch-dependencies

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

<<<<<<< HEAD
      })
=======
      })
>>>>>>> batch-dependencies
