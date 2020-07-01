import * as React from 'react';

import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import { getCSRFToken } from '@hourglass/workflows/student/exams/show/helpers';
// import './index.css';

const URL = '/graphql';

async function graphQLFetcher(graphQLParams: any) {
  return fetch(URL, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    body: JSON.stringify(graphQLParams),
  }).then((response) => response.json());
}

const defaultQuery = `
{
  courses {
    title
    exams {
      id
      name
    }
  }
}
`;

const GIQL: React.FC = () => (
  <div className="vh-100">
    <GraphiQL fetcher={graphQLFetcher} defaultQuery={defaultQuery} />
  </div>
);

export default GIQL;
