import {
  CompletionHandler,
  IInlineCompletionContext,
  IInlineCompletionProvider
} from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';

import { getCompleter, IBaseCompleter } from './llm-models';

/**
 * The generic completion provider to register to the completion provider manager.
 */
export class CompletionProvider implements IInlineCompletionProvider {
  readonly identifier = '@jupyterlite/ai';

  constructor(options: CompletionProvider.IOptions) {
    this.name = options.name;
  }

  /**
   * Getter and setter of the name.
   * The setter will create the appropriate completer, accordingly to the name.
   */
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    this._name = name;
    this._completer = getCompleter(name);
  }

  /**
   * get the current completer.
   */
  get completer(): IBaseCompleter | null {
    return this._completer;
  }

  /**
   * Get the LLM completer.
   */
  get llmCompleter(): LLM | null {
    return this._completer?.provider || null;
  }

  async fetch(
    request: CompletionHandler.IRequest,
    context: IInlineCompletionContext
  ) {
    return this._completer?.fetch(request, context);
  }

  private _name: string = 'None';
  private _completer: IBaseCompleter | null = null;
}

export namespace CompletionProvider {
  export interface IOptions {
    name: string;
  }
}
