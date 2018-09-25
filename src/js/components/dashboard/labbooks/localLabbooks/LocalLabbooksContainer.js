import Labbooks from '../Labbooks';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

export default createFragmentContainer(
  Labbooks,
  graphql`
    fragment LocalLabbooksContainer_labbookList on LabbookQuery{
      labbookList{
        id
        ...LocalLabbooks_localLabbooks
      }
    }
  `,
);
