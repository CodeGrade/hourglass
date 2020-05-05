import React from 'react';
import {
  Navbar,
  Nav,
  Form,
  Button,
} from 'react-bootstrap';
import { getCSRFToken, logOut } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import { User } from '@hourglass/types';
import LockdownInfo from '@hourglass/containers/LockdownInfo';

interface RegularNavbarProps {
  user?: User;
}

export const RegularNavbar: React.FC<RegularNavbarProps> = (props) => {
  const {
    user,
  } = props;
  return (
    <Navbar
      bg="light"
      expand="lg"
      fixed="top"
    >
      <Navbar.Brand
        href={Routes.root_path()}
      >
        Hourglass
      </Navbar.Brand>
      <span className="ml-2">
        <LockdownInfo />
      </span>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {user && (
          <>
            <Navbar.Text
              className="mr-2"
            >
              {user.username}
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
}
