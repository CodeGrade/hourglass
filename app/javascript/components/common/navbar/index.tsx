import React from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import { getCSRFToken } from '@student/exams/show/helpers';
import { Link } from 'react-router-dom';
import { graphql, useQuery, useMutation } from 'relay-hooks';
import { navbarQuery } from './__generated__/navbarQuery.graphql';
import NotLoggedIn from './NotLoggedIn';

function logOut(): void {
  const url = '/users/sign_out';
  fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    credentials: 'same-origin',
  }).then(() => {
    window.location.href = '/';
  }).catch(() => {
    // TODO
  });
}


const RN: React.FC<{
  className?: string;
}> = ({ className }) => {
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
    },
  );
  if (res.error || !res.props) {
    return <NotLoggedIn />;
  }
  return (
    <Navbar
      bg="light"
      expand="md"
      className={className}
    >
      <Navbar.Brand>
        <Link to="/">
          Hourglass
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text
          className="mr-2"
        >
          <span>
            {res.props.impersonating && 'Impersonating '}
            {res.props.me.displayName}
          </span>
        </Navbar.Text>
        <Form inline>
          {res.props.impersonating && (
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
            onClick={logOut}
          >
            Log Out
          </Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default RN;
