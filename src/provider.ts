import {
  ICompletionProviderManager,
  IInlineCompletionProvider
} from '@jupyterlab/completer';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatMistralAI, MistralAI } from '@langchain/mistralai';
import { ISignal, Signal } from '@lumino/signaling';
import { JSONValue, ReadonlyPartialJSONObject } from '@lumino/coreutils';
import * as completionProviders from './completion-providers';
import { ILlmProvider } from './token';
import { IBaseProvider } from './completion-providers/base-provider';

export class LlmProvider implements ILlmProvider {
  constructor(options: LlmProvider.IOptions) {
    this._completionProviderManager = options.completionProviderManager;
  }

  get name(): string | null {
    return this._name;
  }

  get inlineProvider(): IInlineCompletionProvider | null {
    return this._inlineProvider;
  }

  get chatModel(): BaseChatModel | null {
    return this._chatModel;
  }

  setProvider(value: string | null, settings: ReadonlyPartialJSONObject) {
    if (value === null) {
      this._inlineProvider = null;
      this._chatModel = null;
      this._providerChange.emit();
      return;
    }

    const provider = this._completionProviders.get(value) as IBaseProvider;
    if (provider) {
      provider.configure(settings as { [property: string]: JSONValue });
      return;
    }

    if (value === 'MistralAI') {
      this._name = 'MistralAI';
      const mistralClient = new MistralAI({ apiKey: 'TMP', ...settings });
      this._inlineProvider = new completionProviders.CodestralProvider({
        mistralClient
      });
      this._completionProviderManager.registerInlineProvider(
        this._inlineProvider
      );
      this._completionProviders.set(value, this._inlineProvider);
      this._chatModel = new ChatMistralAI({ apiKey: 'TMP', ...settings });
    } else {
      this._inlineProvider = null;
      this._chatModel = null;
    }
    this._providerChange.emit();
  }

  get providerChange(): ISignal<ILlmProvider, void> {
    return this._providerChange;
  }

  private _completionProviderManager: ICompletionProviderManager;
  private _completionProviders = new Map<string, IInlineCompletionProvider>();
  private _name: string | null = null;
  private _inlineProvider: IBaseProvider | null = null;
  private _chatModel: BaseChatModel | null = null;
  private _providerChange = new Signal<ILlmProvider, void>(this);
}

export namespace LlmProvider {
  export interface IOptions {
    completionProviderManager: ICompletionProviderManager;
  }
}
