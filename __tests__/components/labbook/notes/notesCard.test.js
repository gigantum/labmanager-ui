import React from 'react';
import NotesCard from 'Components/labbook/notes/NotesCard';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import Auth from 'JS/Auth/Auth';

let edge ={
  node: {
    "linkedCommit": "dbbc8891ada166a1da21d874e02c8f5085ba514c",
    "commit": "acad13eee2a5959bdd594aa89494564b60604880",
    "level": "USER_MINOR",
    "freeText": "this is free text",
    "tags": [
      "my tag",
      "other tag"
    ],
    "timestamp": "2017-07-26T11:56:00-04:00",
    "message": "User Returned a result",
    "id": "Tm90ZTpkZWZhdWx0JmxhYm9vazQmYWNhZDEzZWVlMmE1OTU5YmRkNTk0YWE4OTQ5NDU2NGI2MDYwNDg4MA==",
    "author": "noreply@gigantum.io"
  },
  "cursor": "MQ=="
}

test('Test note card for rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <NotesCard edge={edge} key={"id"}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

test('Expand/collapase notes card', () =>{

  const notesCard = shallow(
    <NotesCard edge={edge} key={"id"}/>
  );

  notesCard.find('.NotesCard__toggle-button.closed').simulate('click')

  expect(notesCard.find('.NotesCard__toggle-button.open').length).toEqual(1)

  notesCard.find('.NotesCard__toggle-button.open').simulate('click')

  expect(notesCard.find('.NotesCard__toggle-button.closed').length).toEqual(1)
})

describe('Test timestamp function', () =>{

  let notesCard = new NotesCard({edge:edge})

  let timeOfDay = notesCard._getTimeOfDay(edge.node.timestamp)

  return (timeOfDay === '11:56am')
})
