import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AlbumDtoOhneRef } from '../../src/album/rest/albumDTO.entity.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

const geaendertesAlbum: AlbumDtoOhneRef = {
    genre: 'RAP',
    name: 'BOOM',
    titelbild: 'Bang.png',
};
const idVorhanden = '30';

const geaendertesAlbumIdNichtVorhanden: AlbumDtoOhneRef = {
    genre: 'RAP',
    name: 'Knall',
    titelbild: 'Knaller.png',
};
const idNichtVorhanden = '999999';

const geaendertesAlbumInvalid: Record<string, unknown> = {
    genre: 'POP',
    name: ' k',
    titelbild: 'hallo',
    kuenstler: {
        name: ' ',
        vorname: '????',
        alter: -100,
    },
};

const veraltesAlbum: AlbumDtoOhneRef = {
    genre: 'RAP',
    name: 'Zu Alt',
    titelbild: 'Alt.png',
};

// eslint-disable-next-line max-lines-per-function
describe('PUT /rest/:id', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            headers,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandenes Album aendern', async () => {
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBe('');
    });

    test('Nicht-vorhandenes Album aendern', async () => {
        const url = `/rest/${idNichtVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';

        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesAlbumIdNichtVorhanden,
            { headers },
        );

        const { status } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    test('Vorhandenes Album aendern, aber mit ungueltigen Daten', async () => {
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"0"';
        const expectedMsg = [
            expect.stringMatching(/^name /u),
            expect.stringMatching(/^titelbild /u),
            expect.stringMatching(/^kuenstler.name /u),
            expect.stringMatching(/^kuenstler.vorname /u),
            expect.stringMatching(/^kuenstler.alter /u),
        ];

        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesAlbumInvalid,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const messages: string[] = data.message;

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toEqual(expect.arrayContaining(expectedMsg));
    });

    test('Vorhandenes Album aendern, aber ohne Versionsnummer', async () => {
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        delete headers['If-Match'];

        const response: AxiosResponse<string> = await client.put(
            url,
            geaendertesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_REQUIRED);
        expect(data).toBe('Header "If-Match" fehlt');
    });

    test('Vorhandenes Album aendern, aber mit alter Versionsnummer', async () => {
        const url = `/rest/${idVorhanden}`;
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        headers['If-Match'] = '"-1"';

        const response: AxiosResponse<ErrorResponse> = await client.put(
            url,
            veraltesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.PRECONDITION_FAILED);

        const { message, statusCode } = data;

        expect(message).toMatch(/Versionsnummer/u);
        expect(statusCode).toBe(HttpStatus.PRECONDITION_FAILED);
    });

    test('Vorhandenes Album aendern, aber ohne Token', async () => {
        const url = `/rest/${idVorhanden}`;
        delete headers.Authorization;
        headers['If-Match'] = '"0"';

        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Vorhandenes Album aendern, aber mit falschem Token', async () => {
        const url = `/rest/${idVorhanden}`;
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<Record<string, any>> = await client.put(
            url,
            geaendertesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
});
