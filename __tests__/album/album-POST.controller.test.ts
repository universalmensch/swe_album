import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AlbumDTO } from '../../src/album/rest/albumDTO.entity.js';
import { AlbumReadService } from '../../src/album/service/album-read.service.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

const neuesAlbum: AlbumDTO = {
    genre: 'POP',
    name: 'Thunder',
    titelbild: 'Lightning.png',
    kuenstler: {
        name: 'Jackson',
        vorname: 'Michi',
        alter: 28,
    },
    lieder: [
        {
            name: 'Dark',
            dauerInSekunden: 259,
        },
    ],
};
const neuesAlbumInvalid: Record<string, unknown> = {
    genre: 'POP',
    name: 'k',
    titelbild: 'hallo',
    kuenstler: {
        name: ' ',
        vorname: '????',
        alter: -100,
    },
    lieder: [
        {
            name: '            ',
            dauerInSekunden: -99,
        },
    ],
};

// eslint-disable-next-line max-lines-per-function
describe('POST /rest', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

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

    test('Neues Album', async () => {
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<string> = await client.post(
            '/rest',
            neuesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.CREATED);

        const { location } = response.headers as { location: string };

        expect(location).toBeDefined();

        const indexLastSlash: number = location.lastIndexOf('/');

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(AlbumReadService.ID_PATTERN.test(idStr)).toBe(true);

        expect(data).toBe('');
    });

    test('Neues Album mit ungueltigen Daten', async () => {
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        const expectedMsg = [
            expect.stringMatching(/^titelbild /u),
            expect.stringMatching(/^kuenstler.name /u),
            expect.stringMatching(/^kuenstler.vorname /u),
            expect.stringMatching(/^kuenstler.alter /u),
            expect.stringMatching(/^lieder.0.name /u),
            expect.stringMatching(/^lieder.0.dauerInSekunden /u),
        ];

        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAlbumInvalid,
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

    test('Neues Album als Kunde', async () => {
        const token = await loginRest(client, 'adriana.alpha', 'p');
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Neues Album, aber ohne Token', async () => {
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAlbum,
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Neues Album, aber mit falschem Token', async () => {
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAlbum,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test.todo('Abgelaufener Token');
});
