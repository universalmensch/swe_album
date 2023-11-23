/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type Album } from '../../src/album/entity/album.entity.js';
import { type GraphQLFormattedError } from 'graphql';
import { type GraphQLRequest } from '@apollo/server';
import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line jest/no-export
export interface GraphQLResponseBody {
    data?: Record<string, any> | null;
    errors?: readonly [GraphQLFormattedError];
}

type AlbumDTO = Omit<Album, 'lieder' | 'aktualisiert' | 'erzeugt'>;

const idVorhanden = '1';

const kuenstlerVorhanden = 'Konstantin';

const kuenstlerNameVorhanden = 'i';

const kuenstlerNameNichtVorhanden = 'abc';

// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
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

    test('Album zu vorhandener ID', async () => {
        const body: GraphQLRequest = {
            query: `
                {
                    album(id: "${idVorhanden}") {
                        version
                        name
                        kuenstler {
                            name
                        }
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { album } = data.data!;
        const result: AlbumDTO = album;

        expect(result.kuenstler?.name).toMatch(/^\w/u);
        expect(result.version).toBeGreaterThan(-1);
        expect(result.id).toBeUndefined();
    });

    test('Album zu nicht-vorhandener ID', async () => {
        const id = '999999';
        const body: GraphQLRequest = {
            query: `
                {
                    album(id: "${id}") {
                        kuenstler {
                            name
                        }
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.album).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt kein Album mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path!![0]).toBe('album');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Album zu vorhandenem Kuenstler', async () => {
        const body: GraphQLRequest = {
            query: `
                {
                    alben(kuenstler: "${kuenstlerVorhanden}") {
                        genre
                        kuenstler {
                            name
                        }
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { alben } = data.data!;

        expect(alben).not.toHaveLength(0);

        const albenArray: AlbumDTO[] = alben;

        expect(albenArray).toHaveLength(1);

        const [album] = albenArray;

        expect(album!.kuenstler?.name).toBe(kuenstlerVorhanden);
    });

    test('Alben mit einem Teil-Namen des Kuenstlers', async () => {
        const body: GraphQLRequest = {
            query: `
                {
                    alben(kuenstler: "${kuenstlerNameVorhanden}") {
                        genre
                        kuenstler {
                            name
                        }
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { alben } = data.data!;

        expect(alben).not.toHaveLength(0);

        const albenArray: AlbumDTO[] = alben;
        albenArray
            .map((album) => album.kuenstler)
            .forEach((name) =>
                expect(name?.name.toLowerCase()).toEqual(
                    expect.stringContaining(kuenstlerNameVorhanden),
                ),
            );
    });

    test('Alben zu einem nicht vorhandenen Teilname des Kuenstlers', async () => {
        const body: GraphQLRequest = {
            query: `
                {
                    alben(kuenstler: "${kuenstlerNameNichtVorhanden}") {
                        genre
                        kuenstler {
                            name
                        }
                    }
                }
            `,
        };

        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.alben).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Alben gefunden:/u);
        expect(path).toBeDefined();
        expect(path!![0]).toBe('alben');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */
