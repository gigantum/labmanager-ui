
      import React, {Component} from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import MostRecentCode from 'Components/labbook/filesShared/MostRecentCode';
      import store from 'JS/redux/store'

      import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

      import json from './__relaydata__/MostRecentCode.json'

      import relayTestingUtils from 'relay-testing-utils'

      const fixtures = {
        edgeId: json.data.labbook.code.id,
        code: json.data.labbook.code
      }

      store.dispatch({
        type: 'UPDATE_CALLBACK_ROUTE',
        payload: {
          callbackRoute: '/labbooks/username/labbookName/code'
        }
      })

      class MostRecentCodeComponent extends Component{
        render(){
          return(relayTestingUtils.relayWrap(<MostRecentCode {...fixtures}/>, {}, json.data.labbook.code))
        }
      }

      describe('Test MostRecentCode', () => {

        it('Renders snapshot', ()=> {
          const wrapper = renderer.create(
             <Router>
                <Switch>
                <Route
                  path=""
                  render={()=>
                     <MostRecentCodeComponent />
                  }
                />
              </Switch>
             </Router>
          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })

      })
