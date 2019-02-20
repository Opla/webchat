/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SocketService from "./services/socketService";

/**
 * Opla.ai client API
 *
 */
class Api {
  constructor(webService) {
    this.sockets = {};
    this.webService = webService;
    this.authService = webService.authService;
  }

  // TODO
  async authInit() {
    const isAuth = await this.authService.isAccessTokenValid();
    let attributes = null;
    if (isAuth) {
      await this.authService.authorizeAnonymous();
      attributes = await this.authService.getAttributes();
    }
    return attributes;
  }

  async authenticate(username, password) {
    let response = null;
    try {
      response = await this.authService.authenticateUser({
        username,
        password,
      });
    } catch (error) {
      response = error;
    }
    return response;
  }

  async signOut() {
    await this.authService.resetAccess();
  }

  createSocketService(path) {
    const url = this.webService.buildUrl(path, "ws");
    const socketService = new SocketService(url);
    return socketService;
  }

  static subscribe(socketName, socketClient, channelId, callback) {
    socketClient.on("connected", () => {
      // console.log("WebSocket connected: " + botId);
      const payload = JSON.stringify({ event: "subscribe", channelId });
      socketClient.send(payload);
      callback(socketName, "connected");
    });
    socketClient.on("newMessages", (data) => {
      // console.log("WebSocket newMessages: " + data);
      callback(socketName, "newMessages", data);
    });
    socketClient.on("error", (error) => {
      // TODO: handle error
      // console.log("WebSocket error: " + error);
      callback(socketName, "error", error);
    });
    socketClient.on("close", () => {
      // TODO: handle close
      // console.log("WebSocket close");
      callback(socketName, "close");
    });
  }

  unsubscribe(socketName) {
    const socketClient = this.sockets[socketName];
    if (socketClient) {
      socketClient.send("unsubscribe");
      socketClient.close();
      delete this.sockets[socketName];
    }
  }

  subscribeSandboxMessages(botId, callback) {
    const socketName = "sandbox";
    let socketClient = this.sockets[socketName];
    if (socketClient) {
      return;
    }
    socketClient = this.createSocketService("bots/sandbox/messages");
    if (socketClient) {
      Api.subscribe(socketName, socketClient, botId, callback);
    }
    socketClient.start();
  }

  subscribeConversationMessages(conversationId, callback) {
    const socketName = "messenger";
    let socketClient = this.sockets[socketName];
    if (socketClient) {
      return;
    }
    socketClient = this.createSocketService("conversations/messages");
    if (socketClient) {
      Api.subscribe(socketName, socketClient, conversationId, callback);
    }
    socketClient.start();
  }

  async anonymous() {
    let response = null;
    try {
      response = await this.authService.requestAnonymousAccessToken();
    } catch (error) {
      response = error;
    }
    return response;
  }

  async getUserProfile() {
    return this.webService.get("me");
  }

  async getBotParams(token) {
    return this.webService.get(`bots/${token}/params`);
  }

  async getBot(botId) {
    return this.webService.get(`bots/${botId}`);
  }

  async sendSandboxMessage(botId, conversationId, message) {
    return this.webService.post(
      `bots/${botId}/sandbox/messages/${conversationId}`,
      message,
    );
  }

  async resetSandbox(botId) {
    return this.webService.delete(`bots/${botId}/sandbox`);
  }

  async sendConversationMessage(conversationId, message) {
    return this.webService.post(
      `conversations/${conversationId}/messages`,
      message,
    );
  }

  async resetConversationMessages(conversationId) {
    return this.webService.delete(`conversations/${conversationId}/messages`);
  }
}

export default Api;
