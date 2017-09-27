import React from 'react';
import Index from 'JS/index';
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';


test('Test  index rendering', () => {
  let root = document.createElement('div');
  root.id = 'root'
  document.body.appendChild(root)

  it('renders without crashing', () => {
  expect(JSON.stringify(
      Object.assign({}, Index, { _reactInternalInstance: 'censored' })
    )).toMatchSnapshot();
  });
  console.log(document.getElementById('root'))


});
