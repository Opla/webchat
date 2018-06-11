/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
 * Main application Opla Webchat client
 */
const app = { };

const localized = { 
  en: { "Your message": "Your message", "Welcome message": "Welcome fellow user! your virtual assistant, will help you." }, 
  fr: { "Your message": "Votre message", "Welcome message": "Bienvenue cher utilisateur, votre assistant virtuel est là pour vous aider. "  } };

let baseUrl = "https://bot.opla.ai";

const getLocalizedText = (text) => {
  let l = "en";
  if (opla.config.language) {
    l = opla.config.language;
  }
  let ltext = localized[l][text] || text; 
  return ltext;
};

const parseUrl = (url) => {
  const a = document.createElement("a");
  a.href = url;
  return {
    source: url,
    protocol: a.protocol.replace(":", ""),
    host: a.hostname,
    port: a.port,
    pathname: a.pathname
  };
};

const initServices = async () => {
  let host = opla.config.host;
  let port = opla.config.port;
  let protocol = opla.config.protocol;
  let pathname = opla.config.pathname || "";
  let secure = opla.config.secure;
  if (opla.config.url) {
    const url = parseUrl(opla.config.url);
    host = url.host;
    port = url.port;
    pathname = url.pathname;
    opla.config.host = host;
    opla.config.port = port;
    opla.config.pathname = pathname;
    protocol = url.protocol;
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
  const uri = host + (port ? ":" + port : "");
  if (opla.config.token) {
    try {
      const response = await fetch(protocol + "://" + uri + pathname + "/bots/params/" + opla.config.token);
      const params = response.data;
      opla.config = { 
        botId: params.botId, 
        appId: params.application.id, 
        appSecret: params.application.secret, 
        host, 
        port,
        anonymous_secret: params.application.policies["anonymous_secret"],
        secure, 
        language: opla.config.language 
      };
    } catch (e) {
      console.log("Can't fetch bot's params : ", e.message);
      throw new Error(e.message);
    }

  }
  // console.log("opla.config=", opla.config);
  if (!opla.authConfig) {
    const clientId = opla.config.appId;
    const clientSecret = opla.config.appSecret;
    const anonymousSecret = opla.config.anonymous_secret;
    const path = "auth/";
    const url = uri + "/" + path;  
    opla.authConfig = { clientId, clientSecret, url, path, anonymous_secret: anonymousSecret, secure };
  }
  if (!opla.apiConfig) {
    const path = "api/v1/";
    const url = uri + "/" + path;  
    opla.apiConfig = { url, path, secure };
  }
  app.authService = new AuthService(opla.authConfig);
  app.webService = new WebService(opla.apiConfig, app.authService);
  app.api = new Api(app.webService);
};

const sendSandboxMessage = (body) => {
  // BUG not from mik
  const message = { from: "mik", body};
  // WIP send message
  if (body === "#reset") {      
    app.api.resetSandbox(app.bot.id);
    return true;
  } else if (app.bot && app.conversationId) {
    app.api.sendSandboxMessage(app.bot.id, app.conversationId, message);
    return true;
  }
  // app.messenger.appendMessage(message);
  return false;
};

const sendMessage = (body) => {
  if (opla.config.sandbox) {
    return sendSandboxMessage(body);
  }
  const username = app.user.username;
  const message = { from: username, body};
  // WIP send message
  if (body === "#reset") {      
    app.api.resetConversationMessages(app.conversationId);
    return true;
  } else if (app.conversationId) {
    app.api.sendConversationMessage(app.conversationId, message);
    return true;
  }
  // app.messenger.appendMessage(message);
  return false;
};

const appendBeforeScript = (element) => {
  const scripts = document.getElementsByTagName("script");
  document.body.insertBefore(element, scripts[0]);
};

const initMessenger = () => {
  app.messenger = new MessengerContainer(sendMessage);
  const container = app.messenger.render(opla.theme);
  appendBeforeScript(container);
};

const initScreen = () => {
  let el = null;
  if (opla.theme && opla.theme.background) {
    el = document.createElement("div");
    el.className = "content_bg";
    if (opla.theme.background.style) {
      el.setAttribute("style", opla.theme.background.style);
    }
    document.body.insertBefore(el, document.body.firstChild);    
  }
  el = document.createElement("div");
  el.className = "watermark";
  const img = document.createElement("img");
  img.setAttribute("src", baseUrl + "/images/Opla-AI.svg");
  el.appendChild(img);
  appendBeforeScript(el);
  initMessenger();
};

const displayError = (error) => {
  app.messenger.hide();
  if (!app.errorBox) {
    const container = document.createElement("div");
    container.className = "error-box";
    appendBeforeScript(container);
    app.errorBox = container;
  }
  app.errorBox.setAttribute("style", "display: block;");
  app.errorBox.innerHTML = error || "error";
}

const buildPath = (path) => {
  if (path.indexOf("http") === 0) {
    return path;
  }
  const prefix = opla.config.path || "./";
  return prefix + path;
};

const loadCSS = (filename, rel = "stylesheet", type = "text/css") => {
  let path = filename;
  if (filename.indexOf("http") !== 0) {
    path = buildPath(baseUrl + filename);
  }
  const css = document.createElement("link");
  css.setAttribute("rel", rel);
  css.setAttribute("type", type);
  css.setAttribute("href", path);
  document.getElementsByTagName("head")[0].appendChild(css);
};

const initStyle = () => {
  if (opla.theme && opla.theme.fonts) {
    opla.theme.fonts.forEach( fontName => { loadCSS(fontName, "font", "application/font-woff") });
  } else {
    loadCSS("https://fonts.googleapis.com/icon?family=Material+Icons");
    loadCSS("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700");  
  }
  loadCSS("/css/animate.min.css");
  loadCSS("/css/messenger.css");
  loadCSS("/css/app.css");
  
  const style = document.createElement("style");
  document.getElementsByTagName("head")[0].appendChild(style);
  const css = style.sheet;
  // WIP apply css from theme
  if (opla.theme) {
    let item = opla.theme.font || { };
    if (item) {
      css.insertRule(".body { " + item + " }", 0);
    }
    item = opla.theme.fromMessage || { };
    if (item.backgroundColor) {
      css.insertRule(".message.from .text-wrapper:before { border-color: transparent " + item.backgroundColor + " transparent transparent }", 0);
    }
    item = opla.theme.toMessage || { };
    if (item.backgroundColor) {
      css.insertRule(".message.you .text-wrapper:before { border-color: " + item.backgroundColor + " transparent transparent transparent }", 0);
    }
    item = opla.theme.textfield || { };
    if (item.highlightColor) {
      css.insertRule(".mdx-textfield__bar:before, .mdx-textfield__bar:after { background: " + item.highlightColor + "; }", 0);
      css.insertRule("@keyframes mdx-textfield__inputHighlighter { from { background: " + item.highlightColor + "; } }", 0);
      // TODO moz and webkit anim
      /*css.insertRule("@-moz-keyframes mdx-textfield__inputHighlighter { from { background: " + item.highlightColor + "; } }", 0);
      css.insertRule("@-webkit-keyframes mdx-textfield__inputHighlighter { from { background: " + item.highlightColor + "; } }", 0);*/
    }
    if (item.labelColor) {
      css.insertRule(".mdx-textfield__label { color: " + item.labelColor + "; }", 0);
    };
    if (item.inputColor) {
      css.insertRule(".mdx-textfield__input { color: " + item.inputColor + "; }", 0);
    }
    if (item.caretColor) {
      css.insertRule(".mdx-textfield__input { caret-color: " + item.caretColor + "; }", 0);
    }
    item = opla.theme.button || { };
    if (item.style) {
      css.insertRule("button { " + item.style + " }", 0);
    }
  }
};

const authenticate = async () => {
  const api = app.api;
  let isAuth = await api.authInit();
  let res = null;
  if (!isAuth) {
    if (opla.config.username) {
      const username = opla.config.username;
      const password = opla.config.password;
      res = await api.authenticate(username, password);
    } {
      res = await api.anonymous();
    }
    if (res && (!res.error)) {
      isAuth = true;
    }
  }
  if (isAuth) {
    return res;
  } else {
    throw new Error("can't authenticate");
  }
};

const proceedMessages = (name, action, data) => {
  if (action === "newMessages") {
    if (data.length > 0) {
      const conversation = data[0];
      app.conversationId = conversation.id;
      if (conversation.messages.length === 0) {
        app.messenger.resetMessages();
      } else {
        conversation.messages.forEach(message => {
          if (!message.error) {
            app.messenger.appendMessage(message);              
          }
        });  
      }
    }
  }
};

const launchServices = async () => {
  const botId = opla.config.botId;
  // get bot parameters
  let p = await app.api.getBot(botId);
  app.bot = p.result;
  // console.log("app.bot=", app.bot);
  app.messenger.setWelcomeMessage(app.bot.welcome);
  // get user profile
  app.user = await app.api.getUserProfile();
  // console.log("app.user=", app.user);
  const botName = "bot_" + app.bot.name + "_" + app.bot.id;
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
    baseUrl = opla.config.baseUrl;
  }
  initStyle();
  initScreen();
  try {
    await initServices();
    await authenticate();
    await launchServices();
  } catch (error) {
    console.log(error);
    displayError(error.message);
  }
};

window.addEventListener("load", () => {
  console.log("Opla.ai webchat client");
  start();
});