import {
  CompletionHandler,
  IInlineCompletionContext
} from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';

export interface IBaseCompleter {
  /**
   * The LLM completer.
   */
  provider: LLM;

  /**
   * The fetch request for the LLM completer.
   */
  fetch(
    request: CompletionHandler.IRequest,
    context: IInlineCompletionContext
  ): Promise<any>;
}
