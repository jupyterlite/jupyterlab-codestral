import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';

import { IBaseCompleter } from './llm-models';

export interface IAIProvider {
  name: string | null;
  completer: IBaseCompleter | null;
  chatModel: BaseChatModel | null;
  modelChange: ISignal<IAIProvider, void>;
}

export const IAIProvider = new Token<IAIProvider>(
  'jupyterlab-codestral:AIProvider',
  'Provider for chat and completion LLM provider'
);
