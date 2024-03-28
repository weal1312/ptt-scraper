import { it } from 'node:test';
import assert from 'node:assert/strict';
import { database } from './database.js';

it('test database config', () => {
  const dbconfig = database().client.config;
  assert.equal(
    dbconfig.wrapIdentifier('dataMonth', (s: string) => s), 'data_month', 'value should be snakecase');
  assert.deepEqual(
    dbconfig.postProcessResponse({ data_month: 99 }), { dataMonth: 99 }, 'object key should be camelcase');
});
