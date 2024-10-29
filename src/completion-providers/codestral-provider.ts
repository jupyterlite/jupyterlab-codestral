import {
  CompletionHandler,
  IInlineCompletionContext
} from '@jupyterlab/completer';
import { Throttler } from '@lumino/polling';
import { CompletionRequest } from '@mistralai/mistralai';
import type { MistralAI } from '@langchain/mistralai';

import { IBaseProvider } from './base-provider';
import { LLM } from '@langchain/core/language_models/llms';

/*
 * The Mistral API has a rate limit of 1 request per second
 */
const INTERVAL = 1000;

export class CodestralProvider implements IBaseProvider {
  readonly identifier = 'Codestral';
  readonly name = 'Codestral';

  constructor(options: CodestralProvider.IOptions) {
    this._mistralClient = options.mistralClient;
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
      model: 'codestral-latest',
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

export namespace CodestralProvider {
  export interface IOptions {
    mistralClient: MistralAI;
  }
}
