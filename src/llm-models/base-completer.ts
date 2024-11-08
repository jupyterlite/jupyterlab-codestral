import {
  CompletionHandler,
  IInlineCompletionContext
} from '@jupyterlab/completer';
import { BaseLLM } from '@langchain/core/language_models/llms';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

export interface IBaseCompleter {
  /**
   * The LLM completer.
   */
  provider: BaseLLM;

  /**
   * The fetch request for the LLM completer.
   */
  fetch(
    request: CompletionHandler.IRequest,
    context: IInlineCompletionContext
  ): Promise<any>;
}

/**
 * The namespace for the base completer.
 */
export namespace BaseCompleter {
  /**
   * The options for the constructor of a completer.
   */
  export interface IOptions {
    settings: ReadonlyPartialJSONObject;
  }
}
