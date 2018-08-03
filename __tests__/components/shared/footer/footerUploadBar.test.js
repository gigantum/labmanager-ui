import React, { Component } from 'react'
import renderer from 'react-test-renderer';
import FooterUploadBar from 'Components/shared/footer/FooterUploadBar';

describe('FooterUploadBar', () => {

  it('FooterNotificationList rendering', () => {
    const component = renderer.create(
        <FooterUploadBar />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

  });
})
