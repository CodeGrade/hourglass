import Routes from '@hourglass/routes';

export function getCSRFToken(): string {
  const elem: HTMLMetaElement = document.querySelector('[name=csrf-token]');
  return elem.content;
}

export function logOut() {
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
  }).catch((err) => {
    console.error('Error logging out', err);
  });
}
