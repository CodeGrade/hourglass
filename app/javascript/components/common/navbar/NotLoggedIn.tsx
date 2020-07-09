import React from 'react';
import { Navbar } from 'react-bootstrap';

const NotLoggedIn: React.FC = () => (
  <Navbar
    bg="light"
    expand="md"
  >
    <Navbar.Brand>
      <a href="/">
        Hourglass
      </a>
    </Navbar.Brand>
    <Navbar.Toggle />
  </Navbar>
);

export default NotLoggedIn;
