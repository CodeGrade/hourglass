import React from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import { logOut } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import { RailsUser } from '@hourglass/types';
import LockdownInfo from '@hourglass/containers/LockdownInfo';

interface RegularNavbarProps {
  railsUser?: RailsUser;
}

const RegularNavbar: React.FC<RegularNavbarProps> = (props) => {
  const {
    railsUser,
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
      <span className="ml-2 mr-auto">
        <LockdownInfo />
      </span>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {railsUser && (
          <>
            <Navbar.Text
              className="mr-2"
            >
              {railsUser.username}
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

export default RegularNavbar;
