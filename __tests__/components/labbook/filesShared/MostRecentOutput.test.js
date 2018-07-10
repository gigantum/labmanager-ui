
      import React, {Component} from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import MostRecentOutput from 'Components/labbook/filesShared/MostRecentOutput';
      import store from 'JS/redux/store'

      import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

      import json from './__relaydata__/MostRecentOutput.json'

      import relayTestingUtils from 'relay-testing-utils'

      const fixtures = {
        edgeId: json.data.labbook.output.id,
        output: json.data.labbook.output
      }

      store.dispatch({
        type: 'UPDATE_CALLBACK_ROUTE',
        payload: {
          callbackRoute: '/labbooks/username/labbookName/outputData'
        }
      })

      class MostRecentOutputComponent extends Component{
        render(){
          return(relayTestingUtils.relayWrap(<MostRecentOutput {...fixtures}/>, {}, json.data.labbook.output))
        }
      }

      describe('Test MostRecentOutput', () => {
        it('render snapshot', ()=>{
          const wrapper = renderer.create(
             <Router>
               <Switch>

                 <Route

                   path=""
                   render={(props) =>
                     <MostRecentOutputComponent />
                   }
                 />

               </Switch>
             </Router>
          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })


      })
