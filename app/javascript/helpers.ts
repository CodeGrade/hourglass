import { RefObject } from 'react';
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

export function scrollToQuestion(qnum: number) {
  const qElem = document.getElementById(`question-${qnum}`);
  const nav = document.querySelectorAll('.navbar')[0] as HTMLDivElement;
  const navHeight = nav?.offsetHeight ?? 0;
  window.scrollTo({
    left: 0,
    top: qElem.offsetTop - navHeight,
    behavior: 'smooth',
  });
}
