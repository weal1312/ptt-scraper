import type { AwaitedObject } from './types.js';

/** Convert to Snake Case */
export function toSnakeCase(str: string) {
  return (str.charAt(0) + str.slice(1).replaceAll(/[A-Z]/g, '_$&')).toLowerCase();
}

/** Await top-level properties */
export async function awaitProps<T extends Record<string, unknown>, K extends keyof T>(obj: T, ...keys: K[]): Promise<AwaitedObject<T>> {
  if (!keys.length) keys = Object.getOwnPropertyNames(obj) as K[];
  await Promise.all(
    keys.map(k => Promise.resolve(obj[k]).then(r => (obj[k] = r)))
  );
  return obj as AwaitedObject<T>;
}
