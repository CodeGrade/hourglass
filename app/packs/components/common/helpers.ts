import { useState } from 'react';
import { MutationParameters } from 'relay-runtime';
import { HTMLVal } from '@student/exams/show/types';
import {
  Disposable,
  GraphQLTaggedNode,
  useMutation,
  UseMutationConfig,
} from 'react-relay';

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
  return new Promise((resolve) => {
    setTimeout(resolve, milis);
  });
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

export function htmlValOrDefault(val: HTMLVal | undefined | null, defVal: string): HTMLVal {
  return {
    type: 'HTML',
    value: (val?.value !== undefined && val?.value !== '') ? val.value : defVal,
  };
}

export function pluralize(number: number, singular: string, plural: string): string {
  if (number === 0) {
    return `${number} ${plural}`;
  }
  if (Math.abs(number) === 1) {
    return `${number} ${singular}`;
  }
  return `${number} ${plural}`;
}

export type PointsInfo = {
  regularPoints: number;
  extraCreditPoints: number;
}

export function questionPoints(
  questionIsExtraCredit: boolean,
  parts: readonly {points: number, extraCredit?: boolean}[],
): PointsInfo {
  if (questionIsExtraCredit || (parts.length === 1 && parts[0].extraCredit)) {
    return {
      regularPoints: 0,
      extraCreditPoints: parts.reduce((points, part, _idx) => points + part.points, 0),
    };
  }
  return parts.reduce((points, part, _idx) => {
    const { extraCreditPoints, regularPoints } = points;
    return part.extraCredit ? {
      regularPoints,
      extraCreditPoints: extraCreditPoints + part.points,
    } : {
      extraCreditPoints,
      regularPoints: regularPoints + part.points,
    };
  }, { regularPoints: 0, extraCreditPoints: 0 });
}
export function pointsStr(points: Partial<PointsInfo>): string {
  const { extraCreditPoints = 0, regularPoints = 0 } = points;
  const regPointsStr = pluralize(regularPoints, 'point', 'points');
  const extraPointsStr = `${pluralize(extraCreditPoints, 'point', 'points')} extra credit`;
  if (extraCreditPoints === 0) { return regPointsStr; }
  if (regularPoints === 0) {
    return extraPointsStr;
  }
  return `${regPointsStr}, ${extraPointsStr}`;
}

export type SelectOption<T> = {
  label: string;
  value: T;
};

export type SelectOptions<T> = SelectOption<T>[];

type MutateWithVariables<T extends MutationParameters> =
  (config: UseMutationConfig<T>) => Disposable;

export type MutationReturn<T extends MutationParameters> = [
  MutateWithVariables<T>, boolean
];

export function useMutationWithDefaults<TMutation extends MutationParameters>(
  gql: GraphQLTaggedNode,
  defaults: Partial<UseMutationConfig<TMutation>>,
): MutationReturn<TMutation> {
  const [mutate, loading] = useMutation<TMutation>(gql);
  const mutateWithDefaults = (config: UseMutationConfig<TMutation>) => mutate({
    ...defaults,
    ...config,
  });
  return [mutateWithDefaults, loading];
}
