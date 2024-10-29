import { IInlineCompletionProvider } from '@jupyterlab/completer';
import { LLM } from '@langchain/core/language_models/llms';

export interface IBaseProvider extends IInlineCompletionProvider {
  client: LLM;
}
