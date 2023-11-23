import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

const id = '20';

// eslint-disable-next-line max-lines-per-function
describe('DELETE /rest/alben', () => {
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandenes Album loeschen', async () => {
        const url = `/rest/${id}`;
        const token = await loginRest(client);
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`, // eslint-disable-line @typescript-eslint/naming-convention
        };

        const response: AxiosResponse<string> = await client.delete(url, {
            headers,
        });

        const { status, data } = response;

        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBeDefined();
    });

    test('Album loeschen, aber ohne Token', async () => {
        const url = `/rest/${id}`;

        const response: AxiosResponse<Record<string, any>> =
            await client.delete(url);

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Album loeschen, aber mit falschem Token', async () => {
        const url = `/rest/${id}`;
        const token = 'FALSCH';
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`, // eslint-disable-line @typescript-eslint/naming-convention
        };

        const response: AxiosResponse<Record<string, any>> =
            await client.delete(url, { headers });

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
});
