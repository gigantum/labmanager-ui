// vendor
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
// environment
import environment from 'JS/createRelayEnvironment';

// components
import Labbook from './Labbook';
import Loader from 'Components/shared/Loader';
// store
import { setUpdateAll } from 'JS/redux/reducers/routes';
// labbook query with notes fragment
export const LabbookQuery = graphql`
  query LabbookQueryContainerQuery($name: String!, $owner: String!, $first: Int!, $cursor: String, $hasNext: Boolean!){
    labbook(name: $name, owner: $owner){
      id
      description
      ...Labbook_labbook
    }
  }`;

class LabbookQueryContainer extends Component {
  componentDidMount() {
    setUpdateAll(this.props.owner, this.props.labbookName);
  }

  render() {
    const parentProps = this.props;
    return (<QueryRenderer
      environment={environment}
      query={LabbookQuery}
      variables={
          {
            name: parentProps.labbookName,
            owner: parentProps.owner,
            first: 2,
            hasNext: false,
          }
        }
      render={({ error, props }) => {
          if (error) {
            console.log(error);

            return (<div>{error.message}</div>);
          } else if (props) {
            if (props.errors) {
              return (<div>{props.errors[0].message}</div>);
            }


              return (
                <Labbook
                  key={parentProps.labbookName}
                  auth={parentProps.auth}
                  labbookName={parentProps.labbookName}
                  query={props.query}
                  labbook={props.labbook}
                  owner={parentProps.owner}
                  history={parentProps.history}
                  {...parentProps}
                />);
          }

            return (<Loader />);
        }
      }
    />);
  }
}

export default LabbookQueryContainer;
