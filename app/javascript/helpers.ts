import Routes from '@hourglass/routes';
import {
  RailsExamMessage,
  ExamMessage,
  RailsExamQuestion,
  ProfQuestion,
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

/**
 * Flash an element's background color for emphasis.
 */
function pulse(elem: HTMLElement): void {
  const listener = (): void => {
    elem.removeEventListener('animationend', listener);
    elem.classList.remove('bg-pulse');
  };
  elem.addEventListener('animationend', listener);
  elem.classList.add('bg-pulse');
}

function scrollToElem(id: string): void {
  setTimeout(() => {
    const elem = document.getElementById(id);
    const elemTop = elem.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      left: 0,
      top: elemTop + 1,
      behavior: 'smooth',
    });
    pulse(elem);
  });
}

export function scrollToQuestion(qnum: number, pnum?: number): void {
  if (pnum !== undefined) {
    scrollToElem(`question-${qnum}-part-${pnum}`);
  } else {
    scrollToElem(`question-${qnum}`);
  }
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

export function convertQs(qs: RailsExamQuestion[]): ProfQuestion[] {
  return qs.map((m) => ({
    ...m,
    status: 'SENT',
    time: DateTime.fromISO(m.time),
  }));
}

/**
 * Error to throw in the default case of an exhaustive `switch` statement.
 * This will cause a compilation-time error with the missing types.
 * @param v the item being switched over
 */
export class ExhaustiveSwitchError extends Error {
  constructor(v: never) {
    super(`Switch is not exhaustive on ${v}`);
  }
}
