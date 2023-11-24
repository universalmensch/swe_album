/* eslint-disable no-underscore-dangle */

import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AlbenModel } from '../../src/album/rest/album-get.controller.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';

const kuenstlerNameVorhanden = 'i';
const kuenstlerNameNichtVorhanden = 'xx';

// eslint-disable-next-line max-lines-per-function
describe('GET /rest', () => {
    let baseURL: string;
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        baseURL = `https://${host}:${port}/rest`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Alle Alben', async () => {
        const response: AxiosResponse<AlbenModel> = await client.get('/');

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data).toBeDefined();

        const { alben } = data._embedded;

        alben
            .map((album) => album._links.self.href)
            .forEach((selfLink) => {
                const expectedBaseURL = baseURL.toLowerCase();

                expect(selfLink.toLowerCase()).toMatch(
                    // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
                    new RegExp(`^${expectedBaseURL}`, 'u'),
                );
            });
    });

    test('Alben mit einem Teil-Namen des Kuenstlers suchen', async () => {
        const params = { name: kuenstlerNameVorhanden };

        const response: AxiosResponse<AlbenModel> = await client.get('/', {
            params,
        });

        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data).toBeDefined();

        const { alben } = data._embedded;

        alben
            .map((album) => album.kuenstler)
            .forEach((kuenstler) =>
                expect(kuenstler.name.toLowerCase()).toEqual(
                    expect.stringContaining(kuenstlerNameVorhanden),
                ),
            );
    });

    test('Alben zu einem nicht vorhandenen Teilname des Kuenstlers suchen', async () => {
        const params = { name: kuenstlerNameNichtVorhanden };

        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Keine Alben zu einer nicht-vorhandenen Property', async () => {
        const params = { foo: 'bar' };

        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
});
/* eslint-enable no-underscore-dangle */
