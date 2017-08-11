import BreadCrumbs from './../src/js/components/breadCrumbs/breadCrumbs';
import React from 'react';
import renderer from 'react-test-renderer';
import history from './../src/js/history'

test('Test BreadCrumbs Rendering', () => {
      const component = renderer.create(<BreadCrumbs location={history} history={history} />
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

test('Test BreadCrumbs Rendering with pathname', () => {

      history.location.pathName = '/labbook/labook4'
      const component = renderer.create(<BreadCrumbs location={history} history={history} />
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})
