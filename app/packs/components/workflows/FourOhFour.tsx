import React from 'react';
import {
  Alert,
  Table,
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import DocumentTitle from '@hourglass/common/documentTitle';
import { useQuery, graphql } from 'relay-hooks';
import { DateTime } from 'luxon';
import { FourOhFourQuery } from '@hourglass/workflows/__generated__/FourOhFourQuery.graphql';

const FourOhFour: React.FC = () => {
  const { pathname } = useLocation();
  const res = useQuery<FourOhFourQuery>(
    graphql`
    query FourOhFourQuery {
      me {
        displayName
      }
    }
  `,
  );
  return (
    <DocumentTitle title="Not found">
      <div className="wrapper">
        <div className="justify-content-center flex-grow-1 align-items-center d-flex flex-column">
          <div className="d-flex flex-column align-items-center">
            <img src="/find_x.jpg" alt="Find 'x'" />
            <h2>
              Unfortunately, finding
              <code className="mx-2">{pathname}</code>
              isn&rsquo;t as easy as finding
              <code className="ml-2">x</code>
              ...
            </h2>
            <p>Please contact a professor, and provide them with the following information:</p>
            <Alert variant="warning">
              <Table size="sm" className="mb-0" borderless>
                <tbody>
                  <tr>
                    <td>Location:</td>
                    <td><code>{window.location.toString()}</code></td>
                  </tr>
                  <tr>
                    <td>Time:</td>
                    <td><code>{DateTime.local().toISO()}</code></td>
                  </tr>
                  {res.data && (
                    <tr>
                      <td>Username:</td>
                      <td><code>{res.data.me.displayName}</code></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Alert>
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
};

export default FourOhFour;
