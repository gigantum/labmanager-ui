import React from 'react';
import Notes from 'Components/labbook/notes/Notes';
import renderer from 'react-test-renderer';
import config from './../config'
import {mount} from 'enzyme'
import environment from 'JS/createRelayEnvironment'


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

describe('Test Notes toggle', () => {
  const relay = {
    loadMore: () => true
  }
  //const isAuthenticated = function(){return true};
  const component = mount(
    <Notes
      labbook={config.data.labbook}
      key={config.data.labbook.name + '_notes'}
      notes={config.data.labbook.notes}
      labbookName={config.data.labbook.name}
      labbookId={config.data.labbook.id}
      relay={relay}
    />
  );

  let loadClick = component.find('.NotesCard__toggle-button').at(0).simulate('click')

  expect(loadClick).toBeTruthy()

});


describe('Test Notes toggle', () => {
  let notes = new Notes({labbook: config.data.labbook})
  let transformdedNotes = notes._transformNotes(config.data.labbook.notes)
  let note = config.data.labbook.notes.edges[0]
  let date = (note.node.timestamp) ? new Date(note.node.timestamp) : new Date()
  let timeHash = date.getYear() + '_' + date.getMonth() + ' _' + date.getDate();

  expect(transformdedNotes[timeHash] !== undefined).toBeTruthy()
})
