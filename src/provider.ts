import {
  CompletionHandler,
  IInlineCompletionContext,
  IInlineCompletionProvider
} from '@jupyterlab/completer';

import { Debouncer } from '@lumino/polling';

import MistralClient, { CompletionRequest } from '@mistralai/mistralai';

/*
 * The Mistral API has a rate limit of 1 request per second
 */
const INTERVAL = 1000;

export class CodestralProvider implements IInlineCompletionProvider {
  readonly identifier = 'Codestral';
  readonly name = 'Codestral';

  constructor(options: CodestralProvider.IOptions) {
    this._mistralClient = options.mistralClient;
    this._debouncer = new Debouncer(async (data: CompletionRequest) => {
      const response = await this._mistralClient.completion(data);
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
      return this._debouncer.invoke(data);
    } catch (error) {
      console.error('Error fetching completions', error);
      return { items: [] };
    }
  }

  private _debouncer: Debouncer;
  private _mistralClient: MistralClient;
}

export namespace CodestralProvider {
  export interface IOptions {
    mistralClient: MistralClient;
  }
}
