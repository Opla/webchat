/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* global opla */

import Api from "./api";
import AuthService from "./services/authService";
import MessengerContainer from "./components/messengerContainer";
import WebService from "./services/webService";
import fetch from "./services/fetch";

/**
 * Main application Opla Webchat client
 */
const app = {};

let baseUrl = "https://opla.ai/bot";
// let baseUrl = "http://localhost:8085";

const parseUrl = (url) => {
  const a = document.createElement("a");
  a.href = url;
  return {
    source: url,
    protocol: a.protocol.replace(":", ""),
    host: a.hostname,
    port: a.port,
    pathname: a.pathname,
  };
};

const initServices = async () => {
  let { host, port, protocol, pathname = "", secure } = opla.config;
  const { token } = opla.config;
  if (opla.config.url) {
    const url = parseUrl(opla.config.url);
    ({ host, port, pathname, protocol } = url);
    opla.config.host = host;
    opla.config.port = port;
    opla.config.pathname = pathname;
    if (protocol === "https") {
      secure = true;
    } else {
      secure = false;
    }
    opla.config.secure = secure;
  }
  if (!host) {
    throw new Error("No valid API url");
  }
  if (!protocol) {
    protocol = opla.config.secure ? "https" : "http";
  }

  const portRegex = /(.*):(\d*)\/?(.*)/;
  const uri = portRegex.test(host) ? host : `${host}:${port}`;

  if (token) {
    try {
      const response = await fetch(
        `${protocol}://${uri}${pathname}/bots/params/${token}`,
      );
      if (response.error) {
        throw response.error;
      }
      const params = response.data;
      opla.config = {
        botId: params.botId,
        appId: params.application.id,
        appSecret: params.application.secret,
        host,
        port,
        anonymous_secret: params.application.policies.anonymous_secret,
        secure,
        language: opla.config.language,
      };
    } catch (e) {
      throw new Error(`Can't fetch bot's params : ${e.message}`);
    }
  }
  // console.log("opla.config=", opla.config);
  if (!opla.authConfig) {
    const clientId = opla.config.appId;
    const clientSecret = opla.config.appSecret;
    const anonymousSecret = opla.config.anonymous_secret;
    const path = "auth/";
    const url = `${uri}/${path}`;
    opla.authConfig = {
      clientId,
      clientSecret,
      url,
      path,
      anonymous_secret: anonymousSecret,
      secure,
      botToken: token,
    };
  }

  if (!opla.apiConfig) {
    const path = "api/v1/";
    const url = `${uri}/${path}`;
    opla.apiConfig = { url, path, secure };
  }

  app.authService = new AuthService(opla.authConfig);
  app.webService = new WebService(opla.apiConfig, app.authService);
  app.api = new Api(app.webService);
};

const getUsername = () => {
  const { username } = app.authService.username;
  return username;
};

const sendSandboxMessage = async (body) => {
  // console.log("send sandbox message", body);
  const message = { from: getUsername(), body };
  // WIP send message
  if (body === "#reset") {
    await app.api.resetSandbox(app.bot.id);
    return true;
  }
  if (app.bot && app.conversationId) {
    await app.api.sendSandboxMessage(app.bot.id, app.conversationId, message);
    return true;
  }
  // app.messenger.appendMessage(message);
  return false;
};

const sendMessage = async (body) => {
  if (opla.config.sandbox) {
    return sendSandboxMessage(body);
  }
  const { username } = app.user;
  const message = { from: username, body };
  // WIP send message
  if (body === "#reset") {
    await app.api.resetConversationMessages(app.conversationId);
    return true;
  }
  if (app.conversationId) {
    await app.api.sendConversationMessage(app.conversationId, message);
    return true;
  }
  // app.messenger.appendMessage(message);
  return false;
};

const appendBeforeScript = (element, root = null) => {
  if (!root) {
    const script = document.getElementById("opla-webchat-script");
    document.body.insertBefore(element, script);
  } else {
    root.appendChild(element);
  }
};

const initMessenger = (root) => {
  app.messenger = new MessengerContainer(sendMessage);
  const container = app.messenger.render(opla.theme, opla.config.display);
  appendBeforeScript(container, root);
};

const displayMessengerButton = (root) => {
  const el = document.createElement("div");
  el.className = "OpenButton";
  el.addEventListener("click", (e) => {
    e.preventDefault();
    app.messenger.toggleDisplay();
  });
  appendBeforeScript(el, root);
};

const initScreen = () => {
  // displayWebsiteSrc("http://opla.ai/");

  let el = null;
  const root = document.createElement("div");
  root.className = "OplaWebchat";
  appendBeforeScript(root);
  el = document.createElement("div");
  el.className = "Watermark";
  appendBeforeScript(el, root);
  initMessenger(root);

  displayMessengerButton(root);
};

const displayError = (error) => {
  app.messenger.hide();
  if (!app.errorBox) {
    const container = document.createElement("div");
    container.className = "ErrorMessage";
    appendBeforeScript(container);
    app.errorBox = container;
  }
  app.errorBox.setAttribute("style", "display: block;");
  app.errorBox.innerHTML = error || "error";
};

const initStyle = () => {
  const css = document.createElement("link");
  css.setAttribute("rel", "stylesheet");
  css.setAttribute("type", "text/css");
  css.setAttribute("href", `${baseUrl}/css/index.css`);
  document.getElementsByTagName("head")[0].appendChild(css);
  if (opla.config.style) {
    const root = document.documentElement;
    Object.keys(opla.config.style).forEach((v) => {
      root.style.setProperty(`--${v}`, opla.config.style[v]);
    });
  }
};

const authenticate = async () => {
  const { api } = app;
  let isAuth = await api.authInit();
  let res = null;
  if (!isAuth) {
    if (opla.config.username) {
      const { username, password } = opla.config;
      res = await api.authenticate(username, password);
    } else {
      res = await api.anonymous();
    }
    if (res && !res.error) {
      isAuth = true;
    }
  }
  if (isAuth) {
    return res;
  }
  throw new Error("can't authenticate");
};

const proceedMessages = (name, action, data) => {
  if (action === "newMessages") {
    if (data.length > 0) {
      const conversation = data[0];
      app.conversationId = conversation.id;
      if (conversation.messages.length === 0) {
        app.messenger.resetMessages();
      } else {
        conversation.messages.forEach((message) => {
          if (!message.error) {
            app.messenger.appendMessage(message);
          }
        });
      }
    }
  }
};

const launchServices = async () => {
  const { botId } = opla.config;
  // get bot parameters
  const p = await app.api.getBot(botId);
  app.bot = p.result;
  // console.log("app.bot=", app.bot);
  app.messenger.setWelcomeMessage(app.bot.welcome);
  // get user profile
  app.user = await app.api.getUserProfile();
  // console.log("app.user=", app.user);
  const botName = `bot_${app.bot.name}_${app.bot.id}`;
  // console.log("botName", botName);
  // console.log("username", app.user.username);
  const participants = {};
  participants[botName] = { dest: "from", icon: "opla" };
  participants[app.user.username] = { dest: "you", icon: "default" };
  app.messenger.setParticipants(participants);
  // get conversation
  if (opla.config.sandbox) {
    app.api.subscribeSandboxMessages(botId, proceedMessages);
  } else {
    app.conversationId = app.bot.conversationId;
    app.api.subscribeConversationMessages(app.conversationId, proceedMessages);
  }
};

const start = async () => {
  if (opla.config.baseUrl) {
    ({ baseUrl } = opla.config);
  }
  initStyle();
  initScreen();
  try {
    await initServices();
    await authenticate();
    await launchServices();
  } catch (error) {
    displayError(error);
  }
};

window.addEventListener("load", () => {
  start();
});
