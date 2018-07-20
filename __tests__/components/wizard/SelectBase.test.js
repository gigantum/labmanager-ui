
      import React from 'react'
      import renderer from 'react-test-renderer';
      import sinon from 'sinon';
      import {mount} from 'enzyme'
      import SelectBase from 'Components/wizard/SelectBase';

      import json from './__relaydata__/SelectBase.json'
      import relayTestingUtils from 'relay-testing-utils'

      const fixtures = {
        'name': '',
        'description': '',
        'selectedBase': null,
        'selectedBaseId': false,
        'selectedTab': 'python3',
        'viewedBase': null,
        'viewingBase': false,
      }

      describe('SelectBase', () => {

        it('SelectBase snapshot', () => {

          const selectBaseSnap = renderer.create(
               <SelectBase
                {...fixtures}
                />
          )

          const tree = selectBaseSnap.toJSON()

          expect(tree).toMatchSnapshot()

        })
      });


      describe('Test SelectBase', () => {

        const selectBaseCallbackTest = sinon.spy();
        const toggleDisabledContinueTest = sinon.spy();
        const createLabbookMutationTest = sinon.spy();
        const toggleMenuVisibilityTest = sinon.spy();


        const selectBaseMount = mount(
          relayTestingUtils.relayWrap(
            <SelectBase
              {...fixtures}
              selectBaseCallback={selectBaseCallbackTest}
              toggleDisabledContinue={toggleDisabledContinueTest}
              createLabbookMutation={createLabbookMutationTest}
              toggleMenuVisibility={toggleMenuVisibilityTest}
            />, {}, json.data.availableBases
          )
        );
        it('renders loader', ()=>{
          expect(selectBaseMount.find('.Loader').length).toEqual(1);

        })
        // it('Simulates selecting a base', () => {
        //   console.log(selectBaseMount)
        //   console.log(selectBaseMount.find('.SelectBase__image-wrapper'))
        //   selectBaseMount.find('.SelectBase__image-wrapper')[0].simulate('click');

        //   expect(selectBaseCallbackTest).toHaveProperty('callCount', 1);
        //   expect(toggleDisabledContinueTest).toHaveProperty('callCount', 1);

        // });

        // it('Simulates viewing more details', () => {
        //   selectBaseMount.find('.button--flat')[0].simulate('click');
        //   console.log(selectBaseCallbackTest.find('.button--flat'))
        //   expect(toggleMenuVisibilityTest).toHaveProperty('callCount', 1);
        // });
      })