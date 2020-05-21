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
