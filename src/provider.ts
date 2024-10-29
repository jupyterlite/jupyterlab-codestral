import { ICompletionProviderManager } from '@jupyterlab/completer';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatMistralAI, MistralAI } from '@langchain/mistralai';
import { ISignal, Signal } from '@lumino/signaling';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';
import * as completionProviders from './completion-providers';
import { ILlmProvider, IProviders } from './token';
import { IBaseProvider } from './completion-providers/base-provider';
import { isWritable } from './tools';
import { BaseLanguageModel } from '@langchain/core/language_models/base';

export class LlmProvider implements ILlmProvider {
  constructor(options: LlmProvider.IOptions) {
    this._completionProviderManager = options.completionProviderManager;
  }

  get name(): string | null {
    return this._name;
  }

  get completionProvider(): IBaseProvider | null {
    if (this._name === null) {
      return null;
    }
    return (
      this._completionProviders.get(this._name)?.completionProvider || null
    );
  }

  get chatModel(): BaseChatModel | null {
    if (this._name === null) {
      return null;
    }
    return this._completionProviders.get(this._name)?.chatModel || null;
  }

  setProvider(name: string | null, settings: ReadonlyPartialJSONObject) {
    console.log('SET PROVIDER', name);
    if (name === null) {
      // TODO: the inline completion is not disabled, it should be removed/disabled
      // from the manager.
      this._providerChange.emit();
      return;
    }

    const providers = this._completionProviders.get(name);
    if (providers !== undefined) {
      console.log('Provider defined');
      // Update the inline completion provider settings.
      this._updateConfig(providers.completionProvider.client, settings);

      // Update the chat LLM settings.
      this._updateConfig(providers.chatModel, settings);

      if (name !== this._name) {
        this._name = name;
        this._providerChange.emit();
      }
      return;
    }
    console.log('Provider undefined');
    if (name === 'MistralAI') {
      this._name = 'MistralAI';
      const mistralClient = new MistralAI({ apiKey: 'TMP' });
      this._updateConfig(mistralClient, settings);

      const completionProvider = new completionProviders.CodestralProvider({
        mistralClient
      });
      this._completionProviderManager.registerInlineProvider(
        completionProvider
      );

      const chatModel = new ChatMistralAI({ apiKey: 'TMP' });
      this._updateConfig(chatModel as any, settings);

      this._completionProviders.set(name, { completionProvider, chatModel });
    } else {
      this._name = null;
    }
    this._providerChange.emit();
  }

  get providerChange(): ISignal<ILlmProvider, void> {
    return this._providerChange;
  }

  private _updateConfig<T extends BaseLanguageModel>(
    model: T,
    settings: ReadonlyPartialJSONObject
  ) {
    Object.entries(settings).forEach(([key, value], index) => {
      if (key in model) {
        const modelKey = key as keyof typeof model;
        if (isWritable(model, modelKey)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          model[modelKey] = value;
        }
      }
    });
  }

  private _completionProviderManager: ICompletionProviderManager;
  // The ICompletionProviderManager does not allow manipulating the providers,
  // like getting, removing or recreating them. This map store the created providers to
  // be able to modify them.
  private _completionProviders = new Map<string, IProviders>();
  private _name: string | null = null;
  private _providerChange = new Signal<ILlmProvider, void>(this);
}

export namespace LlmProvider {
  export interface IOptions {
    completionProviderManager: ICompletionProviderManager;
  }
}
