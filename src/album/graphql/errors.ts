/**
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei GraphQL.
 * @packageDocumentation
 */

import { GraphQLError } from 'graphql';

// https://www.apollographql.com/docs/apollo-server/data/errors
/**
 * Error-Klasse für GraphQL, die einen Response mit `errors` und
 * code `BAD_USER_INPUT` produziert.
 */
export class BadUserInputError extends GraphQLError {
    constructor(message: string, exception?: Error) {
        super(message, {
            originalError: exception,
            extensions: {
                // https://www.apollographql.com/docs/apollo-server/data/errors/#bad_user_input
                code: 'BAD_USER_INPUT',
            },
        });
    }
}
