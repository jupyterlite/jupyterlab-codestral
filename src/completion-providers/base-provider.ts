import { IInlineCompletionProvider } from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';
import { JSONValue } from '@lumino/coreutils';

export interface IBaseProvider extends IInlineCompletionProvider {
  configure(settings: { [property: string]: JSONValue }): void;
}

// https://stackoverflow.com/questions/54724875/can-we-check-whether-property-is-readonly-in-typescript
export function isWritable<T extends LLM>(obj: T, key: keyof T) {
  const desc =
    Object.getOwnPropertyDescriptor(obj, key) ||
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key) ||
    {};
  return Boolean(desc.writable);
}
