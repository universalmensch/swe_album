/**
 * Das Modul enthält die Funktion, um die Test-DB neu zu laden.
 * @packageDocumentation
 */

import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { release, type, userInfo } from 'node:os';
import { dbType } from '../config/dbtype.js';
import figlet from 'figlet';
import { getLogger } from './logger.js';
import { hash } from 'argon2';
import { nodeConfig } from '../config/node.js';
import process from 'node:process';

/**
 * Beim Start ein Banner ausgeben durch `onApplicationBootstrap()`.
 */
@Injectable()
export class BannerService implements OnApplicationBootstrap {
    readonly #logger = getLogger(BannerService.name);

    /**
     * Die Test-DB wird im Development-Modus neu geladen.
     */
    async onApplicationBootstrap() {
        const { host, nodeEnv, port } = nodeConfig;
        figlet('buch', (_, data) => console.info(data));
        // https://nodejs.org/api/process.html
        // "Template String" ab ES 2015
        this.#logger.info('Node: %s', process.version);
        this.#logger.info('NODE_ENV: %s', nodeEnv);
        this.#logger.info('Rechnername: %s', host);
        this.#logger.info('Port: %s', port);
        this.#logger.info('DB-System: %s', dbType);
        this.#logger.info('Betriebssystem: %s (%s)', type(), release());
        this.#logger.info('Username: %s', userInfo().username);

        // const options: argon2.Options = {...};
        // Argon2 Defaultwerte https://www.rfc-editor.org/rfc/rfc9106.txt
        // t=1 iteration,
        // p=4 lanes,
        // m=2^21 (2 GiB of RAM),
        // 128-bit salt, and
        // 256-bit tag size
        const hashValue = await hash('p');
        this.#logger.debug('argon2id: p -> %s', hashValue);
    }
}
