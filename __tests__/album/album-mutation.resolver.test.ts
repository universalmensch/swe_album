import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type GraphQLRequest } from '@apollo/server';
import { type GraphQLResponseBody } from './album-query.resolver.test.js';
import { HttpStatus } from '@nestjs/common';
import { loginGraphQL } from '../login.js';

// eslint-disable-next-line jest/no-export
export type GraphQLQuery = Pick<GraphQLRequest, 'query'>;

// eslint-disable-next-line max-lines-per-function
describe('GraphQL Mutations', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Neues Album', async () => {
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLQuery = {
            query: `
                mutation {
                    create(
                        input: {
                            genre: POP,
                            name: "Thunder",
                            titelbild: "Lightning.png",
                            kuenstler: {
                                name: "Jackson",
                                vorname: "Michi",
                                alter: 28
                            },
                            lieder: [{
                                name: "Sky",
                                dauerInSekunden: 300
                            }]
                        }
                    ) {
                        id
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data.data).toBeDefined();

        const { create } = data.data!;

        expect(create).toBeDefined();
        expect(create.id).toBeGreaterThan(0);
    });

    // eslint-disable-next-line max-lines-per-function
    test('Album mit ungueltigen Werten neu anlegen', async () => {
        const token = await loginGraphQL(client);
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLQuery = {
            query: `
                mutation {
                    create(
                        input: {
                            genre: POP,
                            name: " k",
                            titelbild: "hallo",
                            kuenstler: {
                                name: " ",
                                vorname: "????",
                                alter: -100
                            },
                            lieder: [{
                                name: "            ",
                                dauerInSekunden: -99
                            }]
                        }
                    ) {
                        id
                    }
                }
            `,
        };
        const expectedMsg = [
            expect.stringMatching(/^titelbild /u),
            expect.stringMatching(/^kuenstler.name /u),
            expect.stringMatching(/^kuenstler.vorname /u),
            expect.stringMatching(/^kuenstler.alter /u),
            expect.stringMatching(/^lieder.0.name /u),
            expect.stringMatching(/^lieder.0.dauerInSekunden /u),
        ];

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.create).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;

        expect(error).toBeDefined();

        const { message } = error;
        const messages: string[] = message.split(',');

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toEqual(expect.arrayContaining(expectedMsg));
    });

    test('Neues Album nur als "admin"/"musikredakteur"', async () => {
        const token =
            'ich bin Hörer lasst mich mal mein Lieblingsalbum anlegen';
        const authorization = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention
        const body: GraphQLQuery = {
            query: `
                mutation {
                    create(
                        input: {
                            genre: ROCK,
                            name: "STONE",
                            titelbild: "BLUE.png",
                            kuenstler: {
                                name: "Jack",
                                vorname: "Michi",
                                alter: 50
                            },
                            lieder: [{
                                name: "k",
                                dauerInSekunden: 60
                            }]
                        }
                    ) {
                        id
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
            { headers: authorization },
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, extensions } = error;

        expect(message).toBe('Forbidden resource');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });
});

/* , @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */
