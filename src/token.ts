import { IInlineCompletionProvider } from '@jupyterlab/completer';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

export interface ILlmProvider {
  name: string | null;
  inlineProvider: IInlineCompletionProvider | null;
  chatModel: BaseChatModel | null;
  providerChange: ISignal<ILlmProvider, void>;
}

export const ILlmProvider = new Token<ILlmProvider>(
  'jupyterlab-codestral:LlmProvider',
  'Provider for chat and completion LLM client'
);
