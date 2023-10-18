import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { BASEDIR } from './app.js';
import { join } from 'node:path';

const SCHEMA_GRAPHQL = join(
    BASEDIR,
    'config',
    'resources',
    'graphql',
    'schema.graphql',
);
console.debug('SCHEMA_GRAPHQL = %s', SCHEMA_GRAPHQL);

/**
 * Das Konfigurationsobjekt für GraphQL (siehe src\app.module.ts).
 */
export const graphQlModuleOptions: ApolloDriverConfig = {
    typePaths: [SCHEMA_GRAPHQL],
    // alternativ: Mercurius (statt Apollo) fuer Fastify (statt Express)
    driver: ApolloDriver,
    playground: false,
    // TODO formatError und logger konfigurieren, damit UserInputError nicht in der Konsole protokolliert wird
};
