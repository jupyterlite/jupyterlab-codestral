import { BaseLanguageModel } from '@langchain/core/language_models/base';

/**
 * This function indicates whether a key is writable in an object.
 * https://stackoverflow.com/questions/54724875/can-we-check-whether-property-is-readonly-in-typescript
 *
 * @param obj - An object extending the BaseLanguageModel interface.
 * @param key - A string as a key of the object.
 * @returns a boolean whether the key is writable or not.
 */
export function isWritable<T extends BaseLanguageModel>(obj: T, key: keyof T) {
  const desc =
    Object.getOwnPropertyDescriptor(obj, key) ||
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key) ||
    {};
  return Boolean(desc.writable);
}
