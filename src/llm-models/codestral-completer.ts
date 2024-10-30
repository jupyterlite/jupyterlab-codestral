import {
  CompletionHandler,
  IInlineCompletionContext
} from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';
import { MistralAI } from '@langchain/mistralai';
import { Throttler } from '@lumino/polling';
import { CompletionRequest } from '@mistralai/mistralai';

import { IBaseCompleter } from './base-completer';

/*
 * The Mistral API has a rate limit of 1 request per second
 */
const INTERVAL = 1000;

export class CodestralCompleter implements IBaseCompleter {
  constructor() {
    this._mistralClient = new MistralAI({
      apiKey: 'TMP',
      model: 'codestral-latest'
    });
    this._throttler = new Throttler(async (data: CompletionRequest) => {
      const response = await this._mistralClient.completionWithRetry(
        data,
        {},
        false
      );
      const items = response.choices.map((choice: any) => {
        return { insertText: choice.message.content as string };
      });

      return {
        items
      };
    }, INTERVAL);
  }

  get client(): LLM {
    return this._mistralClient;
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
      model: this._mistralClient.model,
      // temperature: 0,
      // top_p: 1,
      // max_tokens: 1024,
      // min_tokens: 0,
      stream: false,
      // random_seed: 1337,
      stop: []
    };

    try {
      return this._throttler.invoke(data);
    } catch (error) {
      console.error('Error fetching completions', error);
      return { items: [] };
    }
  }

  private _throttler: Throttler;
  private _mistralClient: MistralAI;
}
