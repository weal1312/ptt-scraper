import type { Knex } from 'knex';
import { database } from './src/database.js';
// Update with your config settings.

export default (database().client as Knex.Client).config;
