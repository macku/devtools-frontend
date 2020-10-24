// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
* WARNING: do not modify this file by hand!
* it was automatically generated by the bridge generator
* if you made changes to the source code and need to update this file, run:
*  npm run generate-bridge-file front_end/inline_editor/ColorSwatch.ts
*/

import './ColorSwatch.js';

import * as Common from '../common/common.js';

// eslint-disable-next-line no-unused-vars
export class ColorSwatchClosureInterface extends HTMLElement {
  /**
  * @param {!Common.Color.Color|string} color
  * @param {(string|boolean)=} formatOrUseUserSetting
  * @param {string=} tooltip
  */
  renderColor(color, formatOrUseUserSetting, tooltip) {
  }
  /**
  * @return {!Common.Color.Color|null}
  */
  get color() {
    throw new Error('Not implemented in _bridge.js');
  }
  /**
  * @return {string|null}
  */
  get format() {
    throw new Error('Not implemented in _bridge.js');
  }
}
/**
* @return {!ColorSwatchClosureInterface}
*/
export function createColorSwatch() {
  return /** @type {!ColorSwatchClosureInterface} */ (document.createElement('devtools-color-swatch'));
}