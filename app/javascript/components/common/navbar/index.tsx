import React, { useContext } from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import { getCSRFToken } from '@student/exams/show/helpers';
import { Link } from 'react-router-dom';
import { graphql, useQuery, useMutation } from 'relay-hooks';
import { AlertContext } from '@hourglass/common/alerts';
import NotLoggedIn from './NotLoggedIn';
// eslint-disable-next-line no-restricted-imports
import NavbarLogo from '../../../images/hourglass.svg';

import { navbarQuery } from './__generated__/navbarQuery.graphql';

async function logOut(): Promise<unknown> {
  const url = '/users/sign_out';
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    credentials: 'same-origin',
  });
}

const RN: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { alert } = useContext(AlertContext);
  const res = useQuery<navbarQuery>(
    graphql`
    query navbarQuery {
      impersonating
      me {
        displayName
      }
    }
    `,
  );
  const [stopImpersonating, { loading }] = useMutation(
    graphql`
    mutation navbarStopImpersonatingMutation {
      stopImpersonating(input: {}) {
        success
      }
    }
    `,
    {
      onCompleted: () => {
        window.location.href = '/';
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error stopping impersonation',
          message: err.message,
        });
      },
    },
  );
  if (res.error || !res.data) {
    return <NotLoggedIn />;
  }
  return (
    <Navbar
      bg="light"
      expand="md"
      className={className}
    >
      <Navbar.Brand>
        <Link to="/" className="d-inline-flex align-items-center">
          <img src={NavbarLogo} alt="Hourglass" className="px-2 d-inline-block" style={{ height: 20 }} />
          <span className="d-inline-block">Hourglass</span>
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text
          className="mr-2"
        >
          <span>
            {res.data.impersonating && 'Impersonating '}
            {res.data.me.displayName}
          </span>
        </Navbar.Text>
        <Form inline>
          {res.data.impersonating && (
            <Button
              disabled={loading}
              className="mr-2"
              variant="outline-danger"
              onClick={() => {
                stopImpersonating({
                  variables: {},
                });
              }}
            >
              Stop impersonating
            </Button>
          )}
          <Button
            variant="outline-danger"
            onClick={() => {
              logOut().then(() => {
                window.location.href = '/';
              }).catch((err) => {
                alert({
                  variant: 'danger',
                  title: 'Error logging out',
                  message: err.message,
                });
              });
            }}
          >
            Log Out
          </Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default RN;
