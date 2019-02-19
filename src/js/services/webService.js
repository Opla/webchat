/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fetch from "./fetch";

class WebService {
  constructor(client, authService) {
    if (client && client.provider) {
      throw new Error("Provider authentification not implemented");
    } else if (!client || !client.url) {
      throw new Error("WebClient not configured");
    }
    this.client = { ...client };
    this.authService = authService;
  }

  buildUrl(route, protocol = "http") {
    const url = this.client.url + route;
    return this.authService.buildAuthUrl(url, protocol);
  }

  send(route, data, method, auth) {
    const isAuth = this.authService.isAuthenticated();
    const url = this.buildUrl(route);
    const clientId = this.authService.getClientId();
    return new Promise((resolve, reject) => {
      if (!isAuth && auth) {
        reject(new Error("not authenticated"));
      } else {
        fetch(url, data, method, { client_id: clientId })
          .then((response) => {
            const res = response.data;
            if (res.error) {
              reject(res.error);
            } else {
              resolve(res);
            }
          })
          .catch((error) => {
            reject(error.message);
          });
      }
    });
  }

  get(route, auth = true) {
    return this.send(route, null, "get", auth);
  }

  post(route, inputData, auth = true) {
    return this.send(route, inputData, "post", auth);
  }

  put(route, inputData, auth = true) {
    return this.send(route, inputData, "put", auth);
  }

  delete(route, auth = true) {
    return this.send(route, null, "delete", auth);
  }
}

export default WebService;
