import { ICompletionProviderManager } from '@jupyterlab/completer';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ISignal, Signal } from '@lumino/signaling';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { CompletionProvider } from './completion-provider';
import { getChatModel, IBaseCompleter } from './llm-models';
import { ILlmProvider } from './token';

export class LlmProvider implements ILlmProvider {
  constructor(options: LlmProvider.IOptions) {
    this._completionProvider = new CompletionProvider({ name: 'None' });
    options.completionProviderManager.registerInlineProvider(
      this._completionProvider
    );
  }

  get name(): string {
    return this._name;
  }

  /**
   * get the current completer of the completion provider.
   */
  get completer(): IBaseCompleter | null {
    if (this._name === null) {
      return null;
    }
    return this._completionProvider.completer;
  }

  /**
   * get the current llm chat model.
   */
  get chatModel(): BaseChatModel | null {
    if (this._name === null) {
      return null;
    }
    return this._llmChatModel;
  }

  /**
   * Set the models (chat model and completer).
   * Creates the models if the name has changed, otherwise only updates their config.
   *
   * @param name - the name of the model to use.
   * @param settings - the settings for the models.
   */
  setModels(name: string, settings: ReadonlyPartialJSONObject) {
    if (name !== this._name) {
      this._name = name;
      this._completionProvider.name = name;
      this._llmChatModel = getChatModel(name);
      this._modelChange.emit();
    }

    // Update the inline completion provider settings.
    if (this._completionProvider.llmCompleter) {
      LlmProvider.updateConfig(this._completionProvider.llmCompleter, settings);
    }

    // Update the chat LLM settings.
    if (this._llmChatModel) {
      LlmProvider.updateConfig(this._llmChatModel, settings);
    }
  }

  get modelChange(): ISignal<ILlmProvider, void> {
    return this._modelChange;
  }

  private _completionProvider: CompletionProvider;
  private _llmChatModel: BaseChatModel | null = null;
  private _name: string = 'None';
  private _modelChange = new Signal<ILlmProvider, void>(this);
}

export namespace LlmProvider {
  /**
   * The options for the LLM provider.
   */
  export interface IOptions {
    /**
     * The completion provider manager in which register the LLM completer.
     */
    completionProviderManager: ICompletionProviderManager;
  }

  /**
   * This function indicates whether a key is writable in an object.
   * https://stackoverflow.com/questions/54724875/can-we-check-whether-property-is-readonly-in-typescript
   *
   * @param obj - An object extending the BaseLanguageModel interface.
   * @param key - A string as a key of the object.
   * @returns a boolean whether the key is writable or not.
   */
  export function isWritable<T extends BaseLanguageModel>(
    obj: T,
    key: keyof T
  ) {
    const desc =
      Object.getOwnPropertyDescriptor(obj, key) ||
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key) ||
      {};
    return Boolean(desc.writable);
  }

  /**
   * Update the config of a language model.
   * It only updates the writable attributes of the model.
   *
   * @param model - the model to update.
   * @param settings - the configuration s a JSON object.
   */
  export function updateConfig<T extends BaseLanguageModel>(
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
}
