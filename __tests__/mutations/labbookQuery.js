import { LabbookQuery } from 'Components/Routes';
import { QueryRenderer } from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import React from 'react';
import renderer from 'react-test-renderer';

export default (variables, cb) => {
  renderer.create(
    <QueryRenderer
      environment={environment}
      query={LabbookQuery}
      variables={variables}
      render={({ error, props }) => {
        if (props) {
          cb(error, props)
          return <div></div>
        } else if (error) {
          console.log(error)
          return <div></div>
        } else {
          return <div></div>
        }
      }}
    />
  );
}
