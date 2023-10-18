/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
