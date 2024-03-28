import knex from 'knex';
import camelcaseKeys from 'camelcase-keys';
import { toSnakeCase } from './utils.js';

export function database(option?: knex.Knex.Config) {
  return knex({
    client: 'pg',
    connection: '',
    wrapIdentifier(value, origImpl): string {
      return origImpl(toSnakeCase(value));
    },
    postProcessResponse(result): unknown {
      return camelcaseKeys(result);
    },
    ...option,
  });
}
