/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fetch from "./fetch";

/**
 * Authentification service
 * 
 */
class AuthService {
  
    constructor(client) {
      if (client && client.provider) {
        throw new Error("Provider authentification not implemented");
      } else if ((!client) || (!client.clientId) || (!client.clientSecret) || (!client.url)) {
        throw new Error("AuthClient not configured");
      }
      this.client = { ...client };
      this.resetAttributes();
    }
    
    resetAttributes() {
      this.authorized = false;
      this.accessToken = null;
      this.expiresIn = null;
      this.scope = null;
      this.username = null; 
      this.user_id = null;      
    }
  
    loadAttributes() {
      const storage = localStorage.getItem(this.client.clientId);
      if (storage) {
        try {
          const data = JSON.parse(storage);
          if (data && typeof data === "object") {
            this.accessToken = data["access_token"];    
            this.expiresIn = data["expires_in"];
            this.scope = data["scope"];
            this.authorized = data["authorized"]; 
            this.username = data["username"]; 
            this.user_id = data["user_id"]; 
          }
        } catch (e) {
          console.log("Error", e);
        }

      }
    }
  
    saveAttributes() {
      const storage = {
        access_token: this.accessToken,
        expires_in: this.expiresIn,
        scope: this.scope,
        authorized: this.authorized,
        username: this.username,
        user_id: this.userId, 
      };
      try {
        localStorage.setItem(this.client.clientId, JSON.stringify(storage));
      } catch (e) {
        console.log("Error", e);
      }
    }
  
    resetAccess() {
      this.resetAttributes();
      localStorage.removeItem(this.client.clientId);
    }
  
    checkAuthentification(shouldReset = false) {
      if (!this.accessToken) {
        this.loadAttributes();
      } else if (shouldReset) {
        this.resetAttributes();
      }
    }
  
    isAuthenticated() {
      this.checkAuthentification();
      return this.accessToken != null;
    }
  
    isAccessTokenValid() {
      this.checkAuthentification(true);
      return !!this.accessToken;
    }
  
    getClientId() {
      return this.client.clientId;
    }
  
    async authenticateUser({ username, password }) {
      // Authorization request
      // TODO password salt
      return this.requestAccessToken({ username, password });
    }
  
    async authorizeAccess({ username, password, scope = null }) {
      // console.log("WIP", "AuthService.authorizeAccess " + username);
      const url = this.buildUrl(this.client.url + "authorize");
      // TODO password hashing
      return fetch(url, { username, password, scope, "client_id": this.client.clientId, "redirect_uri": "localhost" });
    }

    async requestAnonymousAccessToken() {
      // console.log("WIP", "AuthService.requestAccessToken " + username + password + " " + this.client.url); 
      const url = this.buildUrl(this.client.url + "anonymous");
      let response = { };
      try {
        response = await fetch(url, { "client_id": this.client.clientId, "anonymous_secret": this.client.anonymous_secret });
      } catch (error) {
        response.error = error.message;
        console.log("error ", error);
      }

      console.log("requestAnonymousAccessToken", response);
      if (response.error) {
        this.resetAccess();
        throw new Error(error);
      } else {
        const session = response.data;
        // console.log("response ", response);
        if (session.error) {
          this.resetAccess();
          throw new Error(session.error);  
        } else {
          this.accessToken = session["access_token"];
          this.expiresIn = session["expires_in"];
          this.scope = session["scope"];
          this.authorized = true;
          this.username = session["username"];
          this.userId = session["user_id"];
          this.saveAttributes(); 
        }
      }
      return this.getAttributes();
    }
      
    async requestAccessToken({ username, password, authorized = false }) {
      // console.log("WIP", "AuthService.requestAccessToken " + username + password + " " + this.client.url); 
      const url = this.buildUrl(this.client.url + "access_token");
      let response = { };
      try {
        response = await fetch(url, { username, password, "client_id": this.client.clientId, "redirect_uri": "localhost", "grant_type": "password" });
      } catch (error) {
        response.error = error.message;
        console.log("error ", error);
      }

      if (response.error) {
        this.resetAccess();
        if (response.error === "Unauthorized" && (!authorized)) {
          const authorize = await this.authorizeAccess({ username, password });
          // console.log("authorize ", authorize);
          return this.requestAccessToken( { username, password, authorized: true });
        } else {
          throw new Error(error);  
        }
      } else {
        const session = response.data;
        // console.log("response ", response);
        if (session.error) {
          throw new Error(session.error);  
        } else {
          this.accessToken = session["access_token"];
          this.expiresIn = session["expires_in"];
          this.scope = session["scope"];
          this.authorized = true;
          this.saveAttributes(); 
        }
      }
      return this.getAttributes();
    }
      
    getAttributes() {
      return { accessToken: this.accessToken, expiresIn: this.expiresIn, scope: this.scope };
    }
  
    buildUrl(url, protocol) {
      const p = this.getProtocol(protocol);
      return `${p}://${url}`;
    }
  
    getProtocol(protocol = "http") {
      let p = protocol;
      if (this.client.secure) {
        p += "s";
      }
      return p;
    }
  
    buildAuthUrl(url, protocol = "http") {
      if (this.isAuthenticated()) {
        let n = "?access_token=";
        if (url.indexOf("?") > -1) {
          n = "&access_token=";
        }
        return this.buildUrl(url, protocol) + n + this.accessToken;
      } else {
        // TODO check if auth is ok
        return this.buildUrl(url, protocol);
      }
    }
  }
  export default AuthService;
  