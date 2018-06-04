
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'

      import json from './__relaydata__/Branches.json'
      import Branches from 'Components/labbook/branches/Branches';

      import relayTestingUtils from 'relay-testing-utils'

      const toggleBranchesView = () => {

      }

      const setBuildingState = () => {

      }


      let labbook = json.data.labbook
      let fixtures = {
        labbook,
        defaultRemote: labbook.defaultRemote,
        labbookId: labbook.id,
        branchesOpen: true,
        mergeFilter: false,
        activeBranch: labbook.activeBranchName,
        toggleBranchesView,
        setBuildingState,
        setBuildingState

      }

      describe('Branches snapshot', () => {


        it('branches open render', () =>{

          const wrapper = renderer.create(

             relayTestingUtils.relayWrap(<Branches {...fixtures} />, {}, json.data.labbook)

          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })


        it('branches merge open render', () =>{
          fixtures.mergeFilter = true

          const wrapper = renderer.create(

             relayTestingUtils.relayWrap(<Branches {...fixtures} />, {}, json.data.labbook)

          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })

      })
