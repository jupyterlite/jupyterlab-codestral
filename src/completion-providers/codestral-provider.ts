import {
  CompletionHandler,
  IInlineCompletionContext
} from '@jupyterlab/completer';

import { Throttler } from '@lumino/polling';

import { CompletionRequest } from '@mistralai/mistralai';

import type { MistralAI } from '@langchain/mistralai';
import { JSONValue } from '@lumino/coreutils';
import { IBaseProvider, isWritable } from './base-provider';

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

  configure(settings: { [property: string]: JSONValue }): void {
    Object.entries(settings).forEach(([key, value], index) => {
      if (key in this._mistralClient) {
        if (isWritable(this._mistralClient, key as keyof MistralAI)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._mistralClient[key as keyof MistralAI] = value;
        }
      }
    });
  }

  private _throttler: Throttler;
  private _mistralClient: MistralAI;
}

export namespace CodestralProvider {
  export interface IOptions {
    mistralClient: MistralAI;
  }
}
