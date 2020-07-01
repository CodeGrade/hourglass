import React from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import { getCSRFToken } from '@student/exams/show/helpers';
import { Link } from 'react-router-dom';
import environment from '@hourglass/relay/environment';
import { QueryRenderer, graphql } from 'react-relay';
import { useFragment } from 'relay-hooks';
import { navbarQuery, navbarQueryResponse } from './__generated__/navbarQuery.graphql';
import { navbar_me$key } from './__generated__/navbar_me.graphql';

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

const RegularNavbar: React.FC<{
  className?: string
  me: navbarQueryResponse['me'];
}> = (props) => {
  const {
    me,
    className,
  } = props;
  const res = useFragment<navbar_me$key>(
    graphql`
    fragment navbar_me on User {
      createdAt
      displayName
      id
    }
    `,
    me,
  );
  console.log(res.createdAt);
  return (
    <Navbar
      bg="light"
      expand="md"
      className={className}
    >
      <Navbar.Brand>
        {res ? (
          <Link to="/">
            Hourglass
          </Link>
        ) : (
          <a href="/">Hourglass</a>
        )}
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {res && (
          <>
            <Navbar.Text
              className="mr-2"
            >
              {res.displayName}
            </Navbar.Text>
            <Form inline>
              <Button
                variant="outline-danger"
                onClick={logOut}
              >
                Log Out
              </Button>
            </Form>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

const RN: React.FC = () => (
  <QueryRenderer<navbarQuery>
    environment={environment}
    query={graphql`
      query navbarQuery {
        me {
          ...navbar_me
        }
      }
      `}
    variables={{}}
    render={({ error, props }) => {
      if (error) {
        return <div>Error!</div>;
      }
      if (!props) {
        return <div>Loading...</div>;
      }
      return (
        <RegularNavbar me={props.me} />
      );
    }}
  />
);

export default RN;
