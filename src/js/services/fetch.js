/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * fetch polyfill
 */
const fetch = (url, data = null, method = null, headers = {}) => {
  let m = null;
  if (data && method === null) {
    m = "POST";
  } else if (method === null) {
    m = "GET";
  } else {
    m = method.toUpperCase();
  }

  const h = { "Content-Type": "application/json", ...headers };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(m, url);
    Object.keys(h).forEach((key) => {
      xhr.setRequestHeader(key, h[key]);
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.response);
        resolve({ data: res, status: xhr.status });
      } else {
        reject(Error(xhr.statusText));
      }
    };
    xhr.onerror = () => reject(xhr.statusText);
    const json = data ? JSON.stringify(data) : null;
    xhr.send(json);

    const a = {};
    a.func = () => "coucou";
  });
};

export default fetch;
