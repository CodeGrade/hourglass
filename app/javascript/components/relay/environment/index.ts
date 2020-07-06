import {
  Environment,
  Network,
  RecordSource,
  Store,
  Observable,
  SubscribeFunction,
  FetchFunction,
} from 'relay-runtime';
import { getCSRFToken } from '@hourglass/workflows/student/exams/show/helpers';
import ActionCable from 'actioncable';
import createHandler from 'graphql-ruby-client/dist/subscriptions/createHandler';

const fetchQuery: FetchFunction = async (
  operation,
  variables,
) => (
  fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then((response) => response.json())
);

const cable = ActionCable.createConsumer();

const subscriptionHandler = createHandler({
  cable,
});

const handleSubscribe: SubscribeFunction = (operation, variables, cacheConfig) => (
  Observable.create((sink) => {
    subscriptionHandler(operation, variables, cacheConfig, {
      onNext: sink.next,
      onError: sink.error,
      onCompleted: sink.complete,
    });
  })
);

const network = Network.create(fetchQuery, handleSubscribe);

const environment = new Environment({
  network,
  store: new Store(new RecordSource()),
});

export default environment;