import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatMistralAI } from '@langchain/mistralai';
import { JSONObject } from '@lumino/coreutils';

import { IBaseCompleter } from './base-completer';
import { CodestralCompleter } from './codestral-completer';

import mistralAI from '../_provider-settings/mistralAI.json';

/**
 * Get an LLM completer from the name.
 */
export function getCompleter(name: string): IBaseCompleter | null {
  if (name === 'MistralAI') {
    return new CodestralCompleter();
  }
  return null;
}

/**
 * Get an LLM chat model from the name.
 */
export function getChatModel(name: string): BaseChatModel | null {
  if (name === 'MistralAI') {
    return new ChatMistralAI({ apiKey: 'TMP' });
  }
  return null;
}

/**
 * Get an LLM completer from the name.
 */
export function getSettings(name: string): JSONObject | null {
  if (name === 'MistralAI') {
    return mistralAI.definitions.ChatMistralAIInput.properties;
  }
  return null;
}
