import {
  CompletionHandler,
  IInlineCompletionContext,
  IInlineCompletionProvider
} from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';

import { getCompleter, IBaseCompleter, BaseCompleter } from './llm-models';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

/**
 * The generic completion provider to register to the completion provider manager.
 */
export class CompletionProvider implements IInlineCompletionProvider {
  readonly identifier = '@jupyterlite/ai';

  constructor(options: CompletionProvider.IOptions) {
    const { name, settings } = options;
    this.setCompleter(name, settings);
  }

  /**
   * Set the completer.
   *
   * @param name - the name of the completer.
   * @param settings - The settings associated to the completer.
   */
  setCompleter(name: string, settings: ReadonlyPartialJSONObject) {
    try {
      this._completer = getCompleter(name, settings);
      this._name = this._completer === null ? 'None' : name;
    } catch (e: any) {
      this._completer = null;
      this._name = 'None';
      throw e;
    }
  }

  /**
   * Get the current completer name.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get the current completer.
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
  export interface IOptions extends BaseCompleter.IOptions {
    name: string;
  }
}
