/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */
// eslint-disable-next-line no-undef
export default (global.logger = {
  info: (msg, ...opts) => {
    console.log(msg, ...opts);
  },
  error: (msg) => {
    console.error(msg);
  },
  warning: (msg) => {
    console.warn(msg);
  },
});
