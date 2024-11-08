import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOpenAI } from '@langchain/openai';

import { IBaseCompleter } from './base-completer';
import { CodestralCompleter } from './codestral-completer';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';
import { OpenAICompleter } from './openai-completer';

/**
 * Get an LLM completer from the name.
 */
export function getCompleter(
  name: string,
  settings: ReadonlyPartialJSONObject
): IBaseCompleter | null {
  if (name === 'MistralAI') {
    return new CodestralCompleter({ settings });
  } else if (name === 'OpenAI') {
    return new OpenAICompleter({ settings });
  }
  return null;
}

/**
 * Get an LLM chat model from the name.
 */
export function getChatModel(
  name: string,
  settings: ReadonlyPartialJSONObject
): BaseChatModel | null {
  if (name === 'MistralAI') {
    return new ChatMistralAI({ ...settings });
  } else if (name === 'OpenAI') {
    return new ChatOpenAI({ ...settings });
  }
  return null;
}

/**
 * Get the error message from provider.
 */
export function getErrorMessage(name: string, error: any): string {
  if (name === 'MistralAI') {
    return error.message;
  } else if (name === 'OpenAI') {
    return error.message;
  }
  return 'Unknown provider';
}
