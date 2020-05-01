import React from 'react';
import {
  Navbar,
  Dropdown,
  Button,
} from 'react-bootstrap';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { getCSRFToken, logOut } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import { User } from '@hourglass/types';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';

interface ExamNavbarProps {
  user?: User;
  preview: boolean;
  locked: boolean;
}

export const ExamNavbar: React.FC<ExamNavbarProps> = (props) => {
  const {
    preview,
    locked,
  } = props;
  const doSnapshots = locked && !preview;
  const title = 'Hourglass' + (locked ? ' (locked)' : '');
  const bg = locked ? 'dark' : 'light';
  return (
    <Navbar
      bg={bg}
      variant={bg}
      expand="lg"
      fixed="top"
    >
      <Navbar.Brand>
        {title}
      </Navbar.Brand>
      <span className="ml-auto">
        <span className="mr-2">
          <SnapshotInfo />
        </span>
        <Dropdown className="d-inline">
          <Dropdown.Toggle
            className={locked && "text-white"}
            id="toggle-exam-contents"
            variant="outline-secondary"
          >
            <MenuBookIcon />
          </Dropdown.Toggle>
          <Dropdown.Menu alignRight>
            <Dropdown.Item>TODO</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </span>
    </Navbar>
  );
}

/*
TODO: finish exam navbar, and part jumping

<nav class="navbar navbar-dark bg-dark fixed-top" id="exam-nav">
  <span class="navbar-brand">Hourglass (locked)</span>
  <div class="dropdown float-right">
    <button class="btn btn-outline-secondary align-middle" type="button" data-toggle="dropdown"
            style="font-size: 0;">
      <%= octicon "book", height: 24, fill: "white" %>
    </button>
    <div class="dropdown-menu dropdown-menu-right">
      <button class="dropdown-item" id="toggle-paginated" type="button">Toggle paginated display</button>
      <div class="dropdown-divider"></div>
      <span class="dropdown-item-text">Jump to:</span>
      <% @exam.info["questions"].each_with_index do |q, qi| %>
      <button class="dropdown-item question-link" type="button" data-q="<%= qi + 1 %>">
        <%= "Question #{qi + 1}" %>
      </button>
      <% q["parts"].each_with_index do |p, pi| %>
      <button class="dropdown-item ml-3 question-link" type="button"
              data-q="<%= qi + 1 %>" data-p="<%= pi + 1 %>">
        <%= "Question #{qi + 1}-#{pi + 1}" %>
      </button>
      <% end %>
      <% end %>
    </div>
  </div>
</nav>
*/
