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
import { UUID } from '@lumino/coreutils';
import type { ChatMistralAI } from '@langchain/mistralai';
import {
  AIMessage,
  HumanMessage,
  mergeMessageRuns
} from '@langchain/core/messages';

export type ConnectionMessage = {
  type: 'connection';
  client_id: string;
};

export class CodestralHandler extends ChatModel {
  constructor(options: CodestralHandler.IOptions) {
    super(options);
    this._mistralClient = options.mistralClient;
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
    this._history.messages.push(msg);

    const messages = mergeMessageRuns(
      this._history.messages.map(msg => {
        if (msg.sender.username === 'User') {
          return new HumanMessage(msg.body);
        }
        return new AIMessage(msg.body);
      })
    );
    const response = await this._mistralClient.invoke(messages);
    // TODO: fix deprecated response.text
    const content = response.text;
    const botMsg: IChatMessage = {
      id: UUID.uuid4(),
      body: content,
      sender: { username: 'Codestral' },
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

  private _mistralClient: ChatMistralAI;
  private _history: IChatHistory = { messages: [] };
}

export namespace CodestralHandler {
  export interface IOptions extends ChatModel.IOptions {
    mistralClient: ChatMistralAI;
  }
}
