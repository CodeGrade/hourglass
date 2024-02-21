import React, { Suspense, useContext } from 'react';
import {
  Navbar,
  Form,
  Button,
} from 'react-bootstrap';
import { getCSRFToken } from '@student/exams/show/helpers';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useLazyLoadQuery, graphql, useMutation } from 'react-relay';
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
  items?: NavbarItem[];
}> = ({ className, items }) => (
  <Suspense
    fallback={(
      <NotLoggedIn />
    )}
  >
    <RNQuery className={className} items={items} />
  </Suspense>
);
export type NavbarItem = [string, React.ReactNode?];

export const NavbarBreadcrumbs: React.FC<{
  items: NavbarItem[]
}> = ({ items }) => {
  const breadcrumbs = document.getElementById('navbar-breadcrumbs');
  if (breadcrumbs) {
    return (
      createPortal(
        <RenderNavbarBreadcrumbs items={items} />,
        breadcrumbs,
      )
    );
  }
  return (
    <h4>
      Go to
      <RenderNavbarBreadcrumbs items={items} />
    </h4>
  );
};

const RenderNavbarBreadcrumbs: React.FC<{
  items: NavbarItem[]
}> = ({ items }) => (
  <>
    {items.map(([link, title], i) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={i}>
        <span className="mx-1">&raquo;</span>
        {link ? <Link to={link}>{title}</Link> : title}
      </span>
    ))}
  </>
);

const RNQuery: React.FC<{
  className?: string;
  items?: NavbarItem[];
}> = ({ className, items }) => {
  const { alert } = useContext(AlertContext);
  const queryData = useLazyLoadQuery<navbarQuery>(
    graphql`
    query navbarQuery {
      impersonating
      me {
        displayName
      }
    }
    `,
    {},
  );
  const [stopImpersonating, loading] = useMutation(
    graphql`
    mutation navbarStopImpersonatingMutation {
      stopImpersonating(input: {}) {
        success
      }
    }
    `,
  );
  return (
    <Navbar
      bg="light"
      expand="md"
      className={className}
    >
      <Navbar.Brand className="d-inline-flex align-items-center">
        <Link to="/">
          <img src={NavbarLogo} alt="Hourglass" className="px-2 d-inline-block" style={{ height: 20 }} />
          <span className="d-inline-block">Hourglass</span>
        </Link>
        <span id="navbar-breadcrumbs">
          {items && <RenderNavbarBreadcrumbs items={items} />}
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text
          className="mr-2"
        >
          <span>
            {queryData.impersonating && 'Impersonating '}
            {queryData.me.displayName}
          </span>
        </Navbar.Text>
        <Form inline>
          {queryData.impersonating && (
            <Button
              disabled={loading}
              className="mr-2"
              variant="outline-danger"
              onClick={() => {
                stopImpersonating({
                  variables: {},
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
