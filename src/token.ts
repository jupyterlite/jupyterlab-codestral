import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { IBaseCompleter } from './llm-models';

export interface ILlmProvider {
  name: string | null;
  completer: IBaseCompleter | null;
  chatModel: BaseChatModel | null;
  modelChange: ISignal<ILlmProvider, void>;
}

export const ILlmProvider = new Token<ILlmProvider>(
  'jupyterlab-codestral:LlmProvider',
  'Provider for chat and completion LLM client'
);
