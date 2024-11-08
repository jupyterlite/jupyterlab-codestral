import {
  CompletionHandler,
  IInlineCompletionContext
} from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';
import { MistralAI } from '@langchain/mistralai';
import { Throttler } from '@lumino/polling';
import { CompletionRequest } from '@mistralai/mistralai';

import { BaseCompleter, IBaseCompleter } from './base-completer';

/*
 * The Mistral API has a rate limit of 1 request per second
 */
const INTERVAL = 1000;

export class CodestralCompleter implements IBaseCompleter {
  constructor(options: BaseCompleter.IOptions) {
    // this._requestCompletion = options.requestCompletion;
    this._mistralProvider = new MistralAI({ ...options.settings });
    this._throttler = new Throttler(
      async (data: CompletionRequest) => {
        this._invokedData = data;
        let fetchAgain = false;

        // Request completion.
        const response = await this._mistralProvider.completionWithRetry(
          data,
          {},
          false
        );

        // Extract results of completion request.
        let items = response.choices.map((choice: any) => {
          return { insertText: choice.message.content as string };
        });

        // Check if the prompt has changed during the request.
        if (this._invokedData.prompt !== this._currentData?.prompt) {
          // The current prompt does not include the invoked one, the result is
          // cancelled and a new completion will be requested.
          if (!this._currentData?.prompt.startsWith(this._invokedData.prompt)) {
            fetchAgain = true;
            items = [];
          } else {
            // Check if some results contain the current prompt, and return them if so,
            // otherwise request completion again.
            const newItems: { insertText: string }[] = [];
            items.forEach(item => {
              const result = this._invokedData!.prompt + item.insertText;
              if (result.startsWith(this._currentData!.prompt)) {
                const insertText = result.slice(
                  this._currentData!.prompt.length
                );
                newItems.push({ insertText });
              }
            });
            if (newItems.length) {
              items = newItems;
            } else {
              fetchAgain = true;
              items = [];
            }
          }
        }
        return {
          items,
          fetchAgain
        };
      },
      { limit: INTERVAL }
    );
  }

  get provider(): LLM {
    return this._mistralProvider;
  }

  set requestCompletion(value: () => void) {
    this._requestCompletion = value;
  }

  async fetch(
    request: CompletionHandler.IRequest,
    context: IInlineCompletionContext
  ) {
    const { text, offset: cursorOffset } = request;
    const prompt = text.slice(0, cursorOffset);
    const suffix = text.slice(cursorOffset);

    const data = {
      prompt,
      suffix,
      model: this._mistralProvider.model,
      // temperature: 0,
      // top_p: 1,
      // max_tokens: 1024,
      // min_tokens: 0,
      stream: false,
      // random_seed: 1337,
      stop: []
    };

    try {
      this._currentData = data;
      const completionResult = await this._throttler.invoke(data);
      if (completionResult.fetchAgain) {
        if (this._requestCompletion) {
          this._requestCompletion();
        }
      }
      return { items: completionResult.items };
    } catch (error) {
      console.error('Error fetching completions', error);
      return { items: [] };
    }
  }

  private _requestCompletion?: () => void;
  private _throttler: Throttler;
  private _mistralProvider: MistralAI;
  private _invokedData: CompletionRequest | null = null;
  private _currentData: CompletionRequest | null = null;
}
