export type Func = (...args: any) => any;

export interface Mountable {
  mount: (p: any) => Promise<void>;
}

/**
 * Returns a unique number for the given object. If you pass the same object,
 * you get the same number back. Pass a differnt object, get a different number.
 *
 * Used to generate react keys for stateful objects.
 */
export const getKeyForObject = (() => {
  const keyMap = new WeakMap<object, number>();
  let currentKey = 0;

  return function getKeyForObject(obj: object) {
    if (!keyMap.has(obj)) {
      keyMap.set(obj, ++currentKey);
    }
    return keyMap.get(obj)!;
  };
})();

/**
 * A utility type that eagerly expands types to make them
 * easier to read in IntelliSense.
 *
 * @example
 *
 * ```ts
 * // Turns hard to understand IntelliSense types like this one:
 * type Before = Omit<Pick<{a: string, b: number, c: boolean}, "a" | "b">, "a">
 *
 * // Into this:
 * type After = {b: number}
 * ```
 */
type Compute<T> = { [K in keyof T]: T[K] } & {};

type Unprefixed<T, P extends string> = Compute<Omit<T, `${P}${string}`>>;
type Prefixed<T, P extends string> = Compute<
  Pick<T, Extract<keyof T, `${P}${string}`>>
>;

/**
 * Splits `obj` into two objects, one with all fields that start with `prefix`
 * and one with all fields that don't.
 */
export function splitObjectByPrefix<P extends string, T extends object>(
  obj: T,
  prefix: P,
): [Prefixed<T, P>, Unprefixed<T, P>] {
  const prefixed: any = {};
  const unprefixed: any = {};

  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith(prefix)) {
      prefixed[k] = v;
    } else {
      unprefixed[k] = v;
    }
  }
  return [prefixed, unprefixed];
}
