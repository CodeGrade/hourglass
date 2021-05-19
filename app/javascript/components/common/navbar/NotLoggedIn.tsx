import React from 'react';
import { Navbar } from 'react-bootstrap';
// eslint-disable-next-line no-restricted-imports
import NavbarLogo from '../../../images/hourglass.svg';

const NotLoggedIn: React.FC = () => (
  <Navbar
    bg="light"
    expand="md"
  >
    <Navbar.Brand>
      <a href="/" className="d-inline-flex align-items-center">
        <img src={NavbarLogo} alt="Hourglass" className="px-2 d-inline-block" style={{ height: 20 }} />
        Hourglass
      </a>
    </Navbar.Brand>
    <Navbar.Toggle />
  </Navbar>
);

export default NotLoggedIn;
