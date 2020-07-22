import { useState } from 'react';

/**
 * Error to throw in the default case of an exhaustive `switch` statement.
 * This will cause a compilation-time error with the missing types.
 * @param v the item being switched over
 */
export class ExhaustiveSwitchError extends Error {
  constructor(v: never, message?: string) {
    super(`Switch is not exhaustive on \`${JSON.stringify(v)}\`: ${message}`);
  }
}

/**
 * Returns a promise that sleeps for the specified duration before resolving.
 * @param milis duration in miliseconds
 */
export function sleep(milis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milis));
}

export function useRefresher(): [number, () => void] {
  const [refresher, setRefresher] = useState(0);
  return [
    refresher,
    (): void => setRefresher((a) => a + 1),
  ];
}

export function alphabetIdx(idx: number, lowercase = false): string {
  if (lowercase) return String.fromCharCode(97 + idx);
  return String.fromCharCode(65 + idx);
}

export function pluralize(number: number, singular: string, plural: string): string {
  if (number === 0) {
    return `${number} ${plural}`;
  }
  if (number === 1) {
    return `${number} ${singular}`;
  }
  return `${number} ${plural}`;
}

export type SelectOption<T> = {
  label: string;
  value: T;
};

export type SelectOptions<T> = SelectOption<T>[];
