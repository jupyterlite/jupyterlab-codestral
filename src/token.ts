import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';
import { IBaseProvider } from './completion-providers/base-provider';

export interface ILlmProvider {
  name: string | null;
  completionProvider: IBaseProvider | null;
  chatModel: BaseChatModel | null;
  providerChange: ISignal<ILlmProvider, void>;
}

export interface IProviders {
  completionProvider: IBaseProvider;
  chatModel: BaseChatModel;
}

export const ILlmProvider = new Token<ILlmProvider>(
  'jupyterlab-codestral:LlmProvider',
  'Provider for chat and completion LLM client'
);
