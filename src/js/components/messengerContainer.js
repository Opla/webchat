/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getLocalizedText } from "../utils";

class MessengerContainer {
  constructor(onSendMessage) {
    this.onSendMessage = onSendMessage;
    this.messengerContent = null;
    this.participants = {};
    this.display = true;
  }

  hide() {
    if (this.container) {
      this.container.setAttribute("style", "display: none;");
      this.display = false;
    }
  }

  show() {
    if (this.container) {
      this.container.setAttribute("style", "display: block;");
      this.display = true;
    }
  }

  toggleDisplay() {
    if (this.display === true) {
      this.hide();
    } else {
      this.show();
    }
  }

  setParticipants(participants) {
    this.participants = participants;
  }

  getStyle(name, defaultStyle = null) {
    const theme = this.theme[name];
    if (theme && theme.style) {
      return theme.style;
    }
    return defaultStyle;
  }

  setStyle(el, name, defaultStyle = null) {
    const style = this.getStyle(name, defaultStyle);
    MessengerContainer.setSubStyle(el, style);
    if (style) {
      el.setAttribute("style", style);
    }
  }

  static setSubStyle(el, t) {
    if (t && t.style) {
      el.setAttribute("style", t.style);
    }
  }

  // MaterialDesign Input
  // Inspiration : https://codepen.io/sevilayha/pen/IdGKH
  static renderTextField({
    label = null,
    floatingLabel = false,
    onEnter = null,
  }) {
    const container = document.createElement("div");
    container.className = "SendMessage-textField";
    const input = document.createElement("input");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("maxlength", "280");
    input.setAttribute("type", "text");
    input.className = "SendMessage-input";
    input.id = "chat-input-field";
    container.appendChild(input);
    const s = document.createElement("span");
    s.className = "SendMessage-bar";
    container.appendChild(s);
    let l = null;
    if (label) {
      l = document.createElement("label");
      l.setAttribute("for", "chat-input-field");
      l.className = "SendMessage-label";
      l.innerText = label;
      container.appendChild(l);
    }
    input.addEventListener("keyup", (e) => {
      const value = e.target.value || "";
      if (e.key === "Enter" && value.length > 0) {
        let result = false;
        if (onEnter) {
          result = onEnter(value);
        }
        if (result) {
          e.target.value = "";
        }
        return;
      }
      if (!floatingLabel && l) {
        if (value.length > 0) {
          l.setAttribute("style", "display: none;");
        } else {
          l.setAttribute("style", "display: block;");
        }
      }
    });
    return container;
  }

  resetMessages() {
    this.messengerContent.innerHTML = "";
    this.setWelcomeMessage();
  }

  setWelcomeMessage(welcome = this.welcome) {
    // Display Welcome message
    this.welcome = welcome;
    const messageRow = document.createElement("div");
    this.setStyle(messageRow, "welcomeMessage");
    messageRow.className = "MessengerBox-welcomeHeader";
    messageRow.innerText = welcome || getLocalizedText("Welcome message");
    this.messengerContent.appendChild(messageRow);
  }

  static htmlLink(text) {
    return (text || "").replace(
      // the regex can capture link like [complexLabel](complexUrl) or simple url
      // https?:\/\/\S* capture simple url on http(s) and return to match argument
      // \[(.*?)\]\((.*?)\) capture markdown style link and return complexLabel & complexUrl argument
      /https?:\/\/\S*|\[(.*?)\]\((.*?)\)/gi,
      (match, complexLabel, complexUrl) => {
        let url = match;
        let label = url;
        if (complexLabel) {
          label = complexLabel;
          url = complexUrl;
        }
        if (url.match(/\.(jpg|jpeg|gif|png)$/gi)) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" alt="${label}" /></a>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      },
    );
  }

  createMessage(message) {
    const container = document.createElement("span");
    container.className = "Message-body";
    const { body } = message;
    if (body && body.indexOf("<b") >= 0) {
      /* eslint-disable no-restricted-syntax */
      const elements = [];
      let tag = false;
      let end = false;
      let buf = "";
      let element = {};
      for (const ch of message.body) {
        if (ch === "<") {
          if (tag) {
            element.value = buf;
            buf = "";
          } else {
            if (buf.length > 0) {
              elements.push({ value: buf, type: "text" });
            }
            buf = "";
            tag = true;
            end = false;
            element = {};
          }
        } else if (tag && ch === "/") {
          end = true;
        } else if (end && ch === ">") {
          // <tag /> or </tag>
          element.type = buf.trim();
          elements.push(element);
          element = {};
          tag = false;
          buf = "";
        } else if (tag && ch === ">") {
          element.type = buf.trim();
          buf = "";
        } else {
          buf += ch;
        }
      }
      if (buf.length > 0) {
        elements.push({ value: buf, type: "text" });
      }
      elements.forEach((el) => {
        // button and br
        // TODO link / img
        element = null;
        if (el.type === "button") {
          element = document.createElement("button");
          element.className = "Message-button";
          element.innerHTML = el.value;
          element.addEventListener("click", (e) => {
            e.preventDefault();
            if (el.value.length > 0) {
              if (this.onSendMessage) {
                this.onSendMessage(el.value);
              }
            }
          });
        } else if (el.type === "br") {
          element = document.createElement("br");
        } else {
          element = document.createElement("span");
          element.innerHTML = MessengerContainer.htmlLink(el.value);
        }
        container.appendChild(element);
      });
      /* eslint-enable no-restricted-syntax */
    } else {
      container.innerHTML = MessengerContainer.htmlLink(body);
    }
    return container;
  }

  appendMessage(message) {
    let messageRow = document.getElementById(`msg_${message.id}`);
    if (messageRow) {
      // TODO check if body is different
      return;
    }
    const fromUser = message.from;
    const user = this.participants[fromUser];
    let dest = "you";
    let icon = "default";
    if (user) {
      ({ dest, icon } = user);
    }
    let theme = this.theme.fromMessage || {};
    if (dest === "you") {
      theme = this.theme.toMessage || {};
    }
    messageRow = document.createElement("div");
    messageRow.id = `msg_${message.id}`;
    messageRow.className = `Message ${dest} ${icon}`;
    messageRow.setAttribute("timestamp", message.created_time);
    let child = document.createElement("div");
    child.className = "Message-avatar Message-avatar_animated";
    MessengerContainer.setSubStyle(child, theme.icon);
    messageRow.appendChild(child);
    child = document.createElement("div");
    child.className = "Message-text Message-text_animated";
    MessengerContainer.setSubStyle(child, theme.text);
    child.appendChild(this.createMessage(message));
    messageRow.appendChild(child);

    const { children } = this.messengerContent;
    let b = true;
    // console.log("message.created_time", message.timestamp, message.created_time);
    // eslint-disable-next-line no-restricted-syntax
    for (const c of children) {
      if (c.hasAttribute("timestamp")) {
        const timestamp = parseInt(c.getAttribute("timestamp"), 10);
        if (message.created_time < timestamp) {
          this.messengerContent.insertBefore(messageRow, c);
          b = false;
          break;
        }
      }
    }
    if (b) {
      this.messengerContent.appendChild(messageRow);
    }

    const node = this.messengerContent;
    node.scrollTop = node.scrollHeight;
  }

  render(theme = {}, display = true) {
    this.theme = theme;
    this.display = display;

    const container = document.createElement("div");
    container.className = "Messenger-scrim";

    const messengerBox = document.createElement("div");
    messengerBox.className = "MessengerBox";

    this.messengerContent = document.createElement("div");
    this.messengerContent.className = "MessengerBox-content";
    messengerBox.appendChild(this.messengerContent);

    this.oplaPowered = document.createElement("div");
    this.oplaPowered.className = "opla-powered";
    this.oplaPowered.innerHtml =
      "<a href='https://opla.ai'>powered by Opla.ai</a>";

    messengerBox.appendChild(this.oplaPowered);
    const messengerBoxActions = document.createElement("div");
    messengerBoxActions.className = "SendMessage";
    messengerBox.appendChild(messengerBoxActions);
    const textField = MessengerContainer.renderTextField({
      label: getLocalizedText("Your message"),
      onEnter: this.onSendMessage,
    });
    messengerBoxActions.appendChild(textField);

    container.appendChild(messengerBox);

    this.container = container;

    if (this.display === false) {
      this.hide();
    } else {
      this.show();
    }

    return container;
  }
}
export default MessengerContainer;
