/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* global opla */

const localized = {
  en: {
    "Your message": "Your message",
    "Welcome message":
      "Welcome fellow user! your virtual assistant, will help you.",
  },
  fr: {
    "Your message": "Votre message",
    "Welcome message":
      "Bienvenue cher utilisateur, votre assistant virtuel est là pour vous aider. ",
  },
};

// eslint-disable-next-line import/prefer-default-export
export const getLocalizedText = (text) => {
  let l = "en";
  if (opla.config.language) {
    l = opla.config.language;
  }
  return localized[l][text] || text;
};
