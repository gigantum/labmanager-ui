import Labbooks from '../Labbooks';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

export default createFragmentContainer(
  Labbooks,
  graphql`
    fragment RemoteLabbooksContainer_labbookList on LabbookQuery{
      labbookList{
        id
        ...RemoteLabbooks_remoteLabbooks
      }
    }
  `,
);
