/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import {
  ChatModel,
  IChatHistory,
  IChatMessage,
  INewMessage
} from '@jupyter/chat';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import {
  AIMessage,
  HumanMessage,
  mergeMessageRuns
} from '@langchain/core/messages';
import { UUID } from '@lumino/coreutils';

export type ConnectionMessage = {
  type: 'connection';
  client_id: string;
};

export class ChatHandler extends ChatModel {
  constructor(options: ChatHandler.IOptions) {
    super(options);
    this._provider = options.provider;
  }

  get provider(): BaseChatModel | null {
    return this._provider;
  }
  set provider(provider: BaseChatModel | null) {
    this._provider = provider;
  }

  async sendMessage(message: INewMessage): Promise<boolean> {
    message.id = UUID.uuid4();
    const msg: IChatMessage = {
      id: message.id,
      body: message.body,
      sender: { username: 'User' },
      time: Date.now(),
      type: 'msg'
    };
    this.messageAdded(msg);

    if (this._provider === null) {
      const botMsg: IChatMessage = {
        id: UUID.uuid4(),
        body: '**AI provider not configured for the chat**',
        sender: { username: 'ERROR' },
        time: Date.now(),
        type: 'msg'
      };
      this.messageAdded(botMsg);
      return false;
    }

    this._history.messages.push(msg);

    const messages = mergeMessageRuns(
      this._history.messages.map(msg => {
        if (msg.sender.username === 'User') {
          return new HumanMessage(msg.body);
        }
        return new AIMessage(msg.body);
      })
    );

    const response = await this._provider.invoke(messages);
    // TODO: fix deprecated response.text
    const content = response.text;
    const botMsg: IChatMessage = {
      id: UUID.uuid4(),
      body: content,
      sender: { username: 'Bot' },
      time: Date.now(),
      type: 'msg'
    };
    this.messageAdded(botMsg);
    this._history.messages.push(botMsg);
    return true;
  }

  async getHistory(): Promise<IChatHistory> {
    return this._history;
  }

  dispose(): void {
    super.dispose();
  }

  messageAdded(message: IChatMessage): void {
    super.messageAdded(message);
  }

  private _provider: BaseChatModel | null;
  private _history: IChatHistory = { messages: [] };
}

export namespace ChatHandler {
  export interface IOptions extends ChatModel.IOptions {
    provider: BaseChatModel | null;
  }
}
