import {
  Environment,
  Network,
  RecordSource,
  Store,
  Observable,
  SubscribeFunction,
  FetchFunction,
} from 'relay-runtime';
import { getCSRFToken } from '@student/exams/show/helpers';
import ActionCable from 'actioncable';
import { createLegacyRelaySubscriptionHandler } from 'graphql-ruby-client/subscriptions/createRelaySubscriptionHandler';

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
      query: operation.id ?? operation.text,
      variables,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let json;
    try {
      json = await response.json();
    } catch (_e) {
      throw new Error(await response.text());
    }
    if ('errors' in json) {
      throw new Error(json.errors.map(({ message }) => message).join('\n'));
    }
    return json;
  })
);

const cable = ActionCable.createConsumer();

const subscriptionHandler = createLegacyRelaySubscriptionHandler({
  cable,
});

const handleSubscribe: SubscribeFunction = (operation, variables, cacheConfig) => (
  Observable.create((sink) => {
    subscriptionHandler(
      {
        ...operation,
        text: operation.id ?? operation.text,
      },
      variables,
      cacheConfig,
      {
        onNext: sink.next,
        onError: sink.error,
        onCompleted: sink.complete,
      },
    );
  })
);

const network = Network.create(fetchQuery, handleSubscribe);

const environment = new Environment({
  network,
  store: new Store(new RecordSource()),
});

export default environment;
