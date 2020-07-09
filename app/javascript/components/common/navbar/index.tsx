import React from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import { getCSRFToken } from '@student/exams/show/helpers';
import { Link } from 'react-router-dom';
import { graphql, useFragment, useQuery } from 'relay-hooks';
import { navbarQuery } from './__generated__/navbarQuery.graphql';

import { navbar_me$key } from './__generated__/navbar_me.graphql';
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

const RegularNavbar: React.FC<{
  className?: string
  me: navbar_me$key;
}> = (props) => {
  const {
    me,
    className,
  } = props;
  const res = useFragment(
    graphql`
    fragment navbar_me on User {
      displayName
    }
    `,
    me,
  );
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
      </Navbar.Collapse>
    </Navbar>
  );
};

const RN: React.FC<{
  className?: string;
}> = ({ className }) => {
  const res = useQuery<navbarQuery>(
    graphql`
    query navbarQuery {
      me {
        ...navbar_me
      }
    }
    `,
  );
  if (res.error || !res.props) {
    return <NotLoggedIn />;
  }
  return (
    <RegularNavbar className={className} me={res.props.me} />
  );
};

export default RN;
