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

import { BASEDIR } from './app.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// https://nodejs.org/api/fs.html
// https://nodejs.org/api/path.html
// http://2ality.com/2017/11/import-meta.html

export const resourcesDir = resolve(BASEDIR, 'config', 'resources');
// public/private keys und Zertifikat fuer TLS
const tlsDir = resolve(resourcesDir, 'tls');

export const key = readFileSync(resolve(tlsDir, 'private-key.pem')); // eslint-disable-line security/detect-non-literal-fs-filename
export const cert = readFileSync(resolve(tlsDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
