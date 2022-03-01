import React, { Suspense } from 'react';
import {
  Alert,
  Table,
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import DocumentTitle from '@hourglass/common/documentTitle';
import { useLazyLoadQuery, graphql } from 'react-relay';
import { DateTime } from 'luxon';
import { FourOhFourQuery } from '@hourglass/workflows/__generated__/FourOhFourQuery.graphql';
import ErrorBoundary from '@hourglass/common/boundary';

const FourOhFour: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary>
      <Suspense
        fallback={(
          <FourOhFourDisp
            pathname={pathname}
          />
        )}
      >
        <FourOhFourQueryComp
          pathname={pathname}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

const FourOhFourDisp: React.FC<{
  pathname: string;
  displayName?: string;
}> = ({
  pathname,
  displayName,
}) => (
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
                {displayName && (
                  <tr>
                    <td>Username:</td>
                    <td><code>{displayName}</code></td>
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

const FourOhFourQueryComp: React.FC<{
  pathname: string;
}> = ({ pathname }) => {
  const res = useLazyLoadQuery<FourOhFourQuery>(
    graphql`
      query FourOhFourQuery {
        me {
          displayName
        }
      }
    `,
    {},
  );
  return (
    <FourOhFourDisp
      pathname={pathname}
      displayName={res.me.displayName}
    />
  );
};

export default FourOhFour;
