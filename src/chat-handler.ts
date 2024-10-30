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
    this._llmClient = options.llmClient;
  }

  get llmClient(): BaseChatModel | null {
    return this._llmClient;
  }
  set llmClient(client: BaseChatModel | null) {
    this._llmClient = client;
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

    if (this._llmClient === null) {
      const botMsg: IChatMessage = {
        id: UUID.uuid4(),
        body: '**Chat client not configured**',
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

    const response = await this._llmClient.invoke(messages);
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

  private _llmClient: BaseChatModel | null;
  private _history: IChatHistory = { messages: [] };
}

export namespace ChatHandler {
  export interface IOptions extends ChatModel.IOptions {
    llmClient: BaseChatModel | null;
  }
}
