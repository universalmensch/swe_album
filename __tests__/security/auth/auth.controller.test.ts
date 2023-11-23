import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    loginPath,
    port,
    shutdownServer,
    startServer,
} from '../../testserver.js';
import { HttpStatus } from '@nestjs/common';

const username = 'admin';
const password = 'p';
const passwordFalsch = 'FALSCHES_PASSWORT !!!';

// eslint-disable-next-line max-lines-per-function
describe('REST-Schnittstelle /login', () => {
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Login mit korrektem Passwort', async () => {
        const body = `username=${username}&password=${password}`;

        const response: AxiosResponse<{ token: string }> = await client.post(
            loginPath,
            body,
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.OK);

        const { token } = data;
        const tokenParts = token.split('.');

        expect(tokenParts).toHaveLength(3); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(token).toMatch(/^[a-z\d]+\.[a-z\d]+\.[\w-]+$/iu);
    });

    test('Login mit falschem Passwort', async () => {
        const body = `username=${username}&password=${passwordFalsch}`;

        const response: AxiosResponse<Record<string, any>> = await client.post(
            loginPath,
            body,
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNAUTHORIZED);
        expect(data.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(data.message).toMatch(/^Unauthorized$/iu);
    });

    test('Login ohne Benutzerkennung', async () => {
        const body = '';

        const response: AxiosResponse<Record<string, any>> = await client.post(
            loginPath,
            body,
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNAUTHORIZED);
        expect(data.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(data.message).toMatch(/^Unauthorized$/iu);
    });
});
