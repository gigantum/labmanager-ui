import React, { Component } from 'react'
import renderer from 'react-test-renderer';
import FooterNotificationList from 'Components/shared/footer/FooterNotificationList';

describe('FooterNotificationList', () => {

  it('FooterNotificationList rendering', () => {
    const component = renderer.create(
        <FooterNotificationList />

    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

  });
})
