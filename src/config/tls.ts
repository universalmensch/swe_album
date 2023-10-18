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
