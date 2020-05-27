import React, { useContext } from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import Routes from '@hourglass/routes';
import { getCSRFToken } from '@student/exams/show/helpers';
import { RailsContext } from '@hourglass/workflows/student/exams/show/context';
import { Link } from 'react-router-dom';
// import LockdownInfo from '@student/exams/show/containers/LockdownInfo';

function logOut(): void {
  const url = Routes.destroy_user_session_path();
  fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    credentials: 'same-origin',
  }).then(() => {
    window.location = Routes.root_path();
  }).catch(() => {
    // TODO
  });
}

const RegularNavbar: React.FC<{}> = () => {
  const {
    railsUser,
  } = useContext(RailsContext);
  return (
    <Navbar
      bg="light"
      expand="md"
    >
      <Navbar.Brand>
        <Link to="/">
          Hourglass
        </Link>
      </Navbar.Brand>
      {/* TODO */}
      {/* <span className="ml-2 mr-auto"> */}
      {/*   <LockdownInfo /> */}
      {/* </span> */}
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {railsUser && (
          <>
            <Navbar.Text
              className="mr-2"
            >
              {railsUser.displayName}
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
