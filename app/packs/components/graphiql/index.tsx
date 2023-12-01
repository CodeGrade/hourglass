import * as React from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphiQLInterface, GraphiQLProvider } from 'graphiql/dist';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Fetcher } from '@graphiql/toolkit';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'graphiql/graphiql.min.css';

import { getCSRFToken } from '@student/exams/show/helpers';

const URL = '/graphql';

const graphQLFetcher: Fetcher = async (graphQLParams) => (
  fetch(URL, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    body: JSON.stringify(graphQLParams),
  }).then((response) => response.json())
);

const defaultQuery = `
{
  me {
    username
  }
}
`;

const GIQL: React.FC = () => (
  <div className="vh-100">
    <GraphiQLProvider
      fetcher={graphQLFetcher}
      defaultQuery={defaultQuery}
    >
      <GraphiQLInterface />
    </GraphiQLProvider>
  </div>
);

export default GIQL;
