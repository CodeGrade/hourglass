import Routes from '@hourglass/routes';
import {
  RailsExamMessage,
  ExamMessage,
} from '@hourglass/types';
import { DateTime } from 'luxon';

export function getCSRFToken(): string {
  const elem: HTMLMetaElement = document.querySelector('[name=csrf-token]');
  return elem.content;
}

export function logOut(): void {
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

function scrollToElem(id: string): void {
  setTimeout(() => {
    const elem = document.getElementById(id);
    const nav = document.querySelectorAll('.navbar')[0] as HTMLDivElement;
    const navHeight = nav?.offsetHeight ?? 0;
    const elemTop = elem.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      left: 0,
      top: elemTop - navHeight,
      behavior: 'smooth',
    });
  });
}

export function scrollToQuestion(qnum: number): void {
  scrollToElem(`question-${qnum}`);
}

export function scrollToPart(qnum: number, pnum: number): void {
  scrollToElem(`question-${qnum}-part-${pnum}`);
}

/**
 * Returns a promise that sleeps for the specified duration before resolving.
 * @param milis duration in miliseconds
 */
export function sleep(milis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milis));
}

export function convertMsgs(msgs: RailsExamMessage[]): ExamMessage[] {
  return msgs.map((m) => ({
    ...m,
    time: DateTime.fromISO(m.time),
  }));
}
