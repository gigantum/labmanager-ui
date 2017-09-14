import React from 'react';
import Notes from 'Components/labbook/notes/Notes';
import renderer from 'react-test-renderer';
import config from './../config'
test('Test Notes rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <Notes
      labbook={config.data.labbook}
      key={config.data.labbook.name + '_notes'}
      notes={config.data.labbook.notes}
      labbookName={config.data.labbook.name}
      labbookId={config.data.labbook.id}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});
