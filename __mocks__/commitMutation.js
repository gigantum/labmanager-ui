/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule commitRelayModernMutation
 * @flow
 * @format
 */

import  RelayDeclarativeMutationConfig from './RelayDeclarativeMutationConfig';

// const invariant = require('invariant');
// const isRelayModernEnvironment = require('isRelayModernEnvironment');
import warning from 'warning';

import type {Disposable, Variables} from '../util/RelayRuntimeTypes';
import type {DeclarativeMutationConfig} from './RelayDeclarativeMutationConfig';
import type {GraphQLTaggedNode} from './RelayModernGraphQLTag';
import type {PayloadError, UploadableMap} from './RelayNetworkTypes';
import type {Environment, SelectorStoreUpdater} from './RelayStoreTypes';

export type MutationConfig<T> = {|
  configs?: Array<DeclarativeMutationConfig>,
  mutation: GraphQLTaggedNode,
  variables: Variables,
  uploadables?: UploadableMap,
  onCompleted?: ?(response: T, errors: ?Array<PayloadError>) => void,
  onError?: ?(error: Error) => void,
  optimisticUpdater?: ?SelectorStoreUpdater,
  optimisticResponse?: Object,
  updater?: ?SelectorStoreUpdater,
|};

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
function commitRelayModernMutation<T>(
  environment: Environment,
  config: MutationConfig<T>,
): Disposable {
  // invariant(
  //   isRelayModernEnvironment(environment),
  //   'commitRelayModernMutation: expect `environment` to be an instance of ' +
  //     '`RelayModernEnvironment`.',
  // );
  console.log('here 49')
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const mutation = getRequest(config.mutation);
  if (mutation.operationKind !== 'mutation') {
    throw new Error('commitRelayModernMutation: Expected mutation operation');
  }
  let {optimisticResponse, optimisticUpdater, updater} = config;
  const {configs, onError, variables, uploadables} = config;
  const operation = createOperationSelector(mutation, variables);
  // TODO: remove this check after we fix flow.
  if (typeof optimisticResponse === 'function') {
    optimisticResponse = optimisticResponse();
    warning(
      false,
      'commitRelayModernMutation: Expected `optimisticResponse` to be an object, ' +
        'received a function.',
    );
  }
  console.log('here 66')
  if (
    optimisticResponse &&
    mutation.fragment.selections &&
    mutation.fragment.selections.length === 1 &&
    mutation.fragment.selections[0].kind === 'LinkedField'
  ) {
    const mutationRoot = mutation.fragment.selections[0].name;
    warning(
      optimisticResponse[mutationRoot],
      'commitRelayModernMutation: Expected `optimisticResponse` to be wrapped ' +
        'in mutation name `%s`',
      mutationRoot,
    );
  }
  if (configs) {
    ({optimisticUpdater, updater} = RelayDeclarativeMutationConfig.convert(
      configs,
      mutation,
      optimisticUpdater,
      updater,
    ));
  }
  console.log('here 88')
  return environment
    .executeMutation({
      operation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      uploadables,
    })
    .subscribeLegacy({
      onNext: payload => {
        console.log('here 99')
        // NOTE: commitRelayModernMutation has a non-standard use of
        // onCompleted() by calling it on every next value. It may be called
        // multiple times if a network request produces multiple responses.
        const {onCompleted} = config;
        if (onCompleted) {
          const snapshot = environment.lookup(operation.fragment);
          onCompleted((snapshot.data: $FlowFixMe), payload.response.errors);
        }
      },
      onError,
    });
}

export default commitRelayModernMutation
