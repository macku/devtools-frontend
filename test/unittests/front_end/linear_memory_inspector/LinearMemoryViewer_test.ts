// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {ByteSelectedEvent, LinearMemoryViewer} from '../../../../front_end/linear_memory_inspector/LinearMemoryViewer.js';
import {assertElement, assertElements, assertShadowRoot, getEventPromise, renderElementIntoDOM} from '../helpers/DOMHelpers.js';

const {assert} = chai;

const NUM_BYTES_PER_GROUP = 4;
const BYTE_CELL_SELECTOR = '.byte-cell';
const TEXT_CELL_SELECTOR = '.text-cell';
const ROW_SELECTOR = '.row';
const ADDRESS_SELECTOR = '.address';

describe('LinearMemoryViewer', () => {
  function setUpComponent() {
    const component = new LinearMemoryViewer();
    renderElementIntoDOM(component);
    const data = createComponentData();
    component.data = data;
    return {component, data};
  }

  function createComponentData() {
    const memory = [];
    for (let i = 0; i < 1000; ++i) {
      memory.push(i);
    }

    const data = {
      memory: new Uint8Array(memory),
      address: 20,
    };

    return data;
  }

  function getCellsPerRow(component: LinearMemoryViewer, cellSelector: string) {
    assertShadowRoot(component.shadowRoot);
    const row = component.shadowRoot.querySelector(ROW_SELECTOR);
    assertElement(row, HTMLDivElement);
    const cellsPerRow = row.querySelectorAll(cellSelector);
    assert.isNotEmpty(cellsPerRow);
    assertElements(cellsPerRow, HTMLSpanElement);
    return cellsPerRow;
  }

  describe('address view', () => {
    it('renders one address per row', async () => {
      const {component} = setUpComponent();
      assertShadowRoot(component.shadowRoot);
      const rows = component.shadowRoot.querySelectorAll(ROW_SELECTOR);
      const addresses = component.shadowRoot.querySelectorAll(ADDRESS_SELECTOR);
      assert.isNotEmpty(rows);
      assert.strictEqual(rows.length, addresses.length);
    });

    it('renders addresses depending on the bytes per row', async () => {
      const {component} = setUpComponent();
      const bytesPerRow = getCellsPerRow(component, BYTE_CELL_SELECTOR);
      const numBytesPerRow = bytesPerRow.length;

      assertShadowRoot(component.shadowRoot);
      const addresses = component.shadowRoot.querySelectorAll(ADDRESS_SELECTOR);
      assert.isNotEmpty(addresses);

      for (let i = 0, currentAddress = 0; i < addresses.length; currentAddress += numBytesPerRow, ++i) {
        const addressElement = addresses[i];
        assertElement(addressElement, HTMLSpanElement);

        const hex = currentAddress.toString(16).padStart(8, '0');
        assert.strictEqual(addressElement.innerText, hex);
      }
    });
  });

  describe('bytes view', () => {
    it('renders unsplittable byte group', async () => {
      const thinWrapper = document.createElement('div');
      thinWrapper.style.width = '10px';

      const component = new LinearMemoryViewer();
      component.data = createComponentData();
      thinWrapper.appendChild(component);

      const bytesPerRow = getCellsPerRow(component, BYTE_CELL_SELECTOR);
      assert.strictEqual(bytesPerRow.length, NUM_BYTES_PER_GROUP);
    });

    it('renders byte values corresponding to memory set', async () => {
      const {component, data} = setUpComponent();
      assertShadowRoot(component.shadowRoot);
      const bytes = component.shadowRoot.querySelectorAll(BYTE_CELL_SELECTOR);
      assertElements(bytes, HTMLSpanElement);

      const memory = data.memory;
      assert.isAtMost(bytes.length, memory.length);
      for (let i = 0; i < bytes.length; ++i) {
        const hex = memory[i].toString().padStart(2, '0');
        assert.strictEqual(bytes[i].innerText, hex);
      }
    });
  });

  describe('ascii view', () => {
    it('renders as many ascii values as byte values in a row', async () => {
      const {component} = setUpComponent();
      const bytes = getCellsPerRow(component, BYTE_CELL_SELECTOR);
      const ascii = getCellsPerRow(component, TEXT_CELL_SELECTOR);

      assert.strictEqual(bytes.length, ascii.length);
    });

    it('renders ascii values corresponding to bytes', async () => {
      const {component} = setUpComponent();
      assertShadowRoot(component.shadowRoot);

      const asciiValues = component.shadowRoot.querySelectorAll(TEXT_CELL_SELECTOR);
      const byteValues = component.shadowRoot.querySelectorAll(BYTE_CELL_SELECTOR);
      assertElements(asciiValues, HTMLSpanElement);
      assertElements(byteValues, HTMLSpanElement);
      assert.strictEqual(byteValues.length, asciiValues.length);

      const smallestPrintableAscii = 20;
      const largestPrintableAscii = 127;

      for (let i = 0; i < byteValues.length; ++i) {
        const byteValue = parseInt(byteValues[i].innerText, 16);
        const asciiText = asciiValues[i].innerText;
        if (byteValue < smallestPrintableAscii || byteValue > largestPrintableAscii) {
          assert.strictEqual(asciiText, '.');
        } else {
          assert.strictEqual(asciiText, String.fromCharCode(byteValue));
        }
      }
    });
  });

  describe('setting the address', () => {
    function assertSelectedCellIsHighlighted(component: LinearMemoryViewer, cellSelector: string, index: number) {
      assertShadowRoot(component.shadowRoot);
      const selectedCells = component.shadowRoot.querySelectorAll(cellSelector + '.selected');
      assert.lengthOf(selectedCells, 1);
      assertElements(selectedCells, HTMLSpanElement);
      const selectedCell = selectedCells[0];

      const allCells = getCellsPerRow(component, cellSelector);
      assert.isAtLeast(allCells.length, index);
      const cellAtAddress = allCells[index];

      assert.strictEqual(selectedCell, cellAtAddress);
    }

    it('highlights selected byte value', async () => {
      const component = new LinearMemoryViewer();
      const memory = new Uint8Array([2, 3, 5, 3]);
      const address = 2;

      renderElementIntoDOM(component);
      component.data = {
        memory,
        address,
      };

      assertSelectedCellIsHighlighted(component, BYTE_CELL_SELECTOR, address);
      assertSelectedCellIsHighlighted(component, TEXT_CELL_SELECTOR, address);
      assertSelectedCellIsHighlighted(component, ADDRESS_SELECTOR, 0);
    });

    it('triggers an event', async () => {
      const {component} = setUpComponent();
      assertShadowRoot(component.shadowRoot);

      const byte = component.shadowRoot.querySelector(BYTE_CELL_SELECTOR);
      assertElement(byte, HTMLSpanElement);

      const eventPromise = getEventPromise<ByteSelectedEvent>(component, 'byte-selected');
      byte.click();
      const {data: address} = await eventPromise;
      assert.strictEqual(address, 0);
    });
  });
});