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
import MistralClient from '@mistralai/mistralai';

export type ConnectionMessage = {
  type: 'connection';
  client_id: string;
};

export class CodestralHandler extends ChatModel {
  constructor(options: CodestralHandler.IOptions) {
    super(options);
    this._mistralClient = options.mistralClient;
  }

  async addMessage(message: INewMessage): Promise<boolean> {
    message.id = UUID.uuid4();
    const msg: IChatMessage = {
      id: message.id,
      body: message.body,
      sender: 'User',
      time: Date.now(),
      type: 'msg'
    };
    this.messageAdded(msg);
    this._history.messages.push(msg);
    const response = await this._mistralClient.chat({
      model: 'codestral-latest',
      messages: this._history.messages.map(msg => {
        return {
          role: msg.sender === 'User' ? 'user' : 'assistant',
          content: msg.body
        };
      })
    });
    if (response.choices.length === 0) {
      return false;
    }
    const botMessage = response.choices[0].message;
    const botMsg: IChatMessage = {
      id: UUID.uuid4(),
      body: botMessage.content as string,
      sender: 'Codestral',
      time: Date.now(),
      type: 'msg'
    };
    this.messageAdded(botMsg);
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

  private _mistralClient: MistralClient;
  private _history: IChatHistory = { messages: [] };
}

export namespace CodestralHandler {
  export interface IOptions extends ChatModel.IOptions {
    mistralClient: MistralClient;
  }
}
