import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as utils from './utils.js';

describe('test toSnakeCase', () => {
  it('camel', () => {
    const str = utils.toSnakeCase('acbX');
    assert.equal(str, 'acb_x');
  });
  it('pascal', () => {
    const str = utils.toSnakeCase('AcbX');
    assert.equal(str, 'acb_x');
  });
  it('empty', () => {
    assert.equal(utils.toSnakeCase(''), '');
  });
});

describe('test awaitProps', () => {
  it('common', async () => {
    const data = { a: 123, b: 456, c: 999 };
    assert.deepEqual(data, await utils.awaitProps({
      ...data,
      b: Promise.resolve(data.b)
    }));
  });
  it('spec key', async () => {
    const data = {
      a: Promise.resolve(55),
      b: Promise.resolve(31),
    };
    const res = await utils.awaitProps({ ...data }, 'a');
    assert.deepEqual({ ...data, a: 55 }, res);
  });
});
