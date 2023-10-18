/**
 * Das Modul enthält die Konfiguration für den _Node_-basierten Server.
 * @packageDocumentation
 */

import { cert, key, resourcesDir } from './tls.js';
import { type HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface.js';
import { config } from './app.js';
import { env } from './env.js';
import { hostname } from 'node:os';

const { NODE_ENV } = env;

const computername = hostname();
const port = (config.node?.port as number | undefined) ?? 3000; // eslint-disable-line @typescript-eslint/no-magic-numbers

// https://nodejs.org/api/fs.html
// https://nodejs.org/api/path.html
// http://2ality.com/2017/11/import-meta.html

const httpsOptions: HttpsOptions = {
    // Shorthand Properties:   key: key
    key,
    cert,
};

/**
 * Die Konfiguration für den _Node_-basierten Server:
 * - Rechnername
 * - IP-Adresse
 * - Port
 * - `PEM`- und Zertifikat-Datei mit dem öffentlichen und privaten Schlüssel
 *   für TLS
 */
// "as const" fuer readonly
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
// TODO records als "deeply immutable data structure" (Stage 2)
// https://github.com/tc39/proposal-record-tuple
export const nodeConfig = {
    // Shorthand Property ab ES 2015
    host: computername,
    port,
    resourcesDir,
    httpsOptions,
    nodeEnv: NODE_ENV as
        | 'development'
        | 'PRODUCTION'
        | 'production'
        | 'test'
        | undefined,
} as const;
