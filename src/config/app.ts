/**
 * Das Modul enthält Objekte mit Konfigurationsdaten aus der YAML-Datei.
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { resolve } from 'node:path';

// im Docker-Image gibt es kein Unterverzeichnis "src"
export const BASEDIR = existsSync('src') ? 'src' : 'dist';

const configFile = resolve(BASEDIR, 'config', 'resources', 'app.yml');
export const config = load(
    readFileSync(configFile, 'utf8'), // eslint-disable-line security/detect-non-literal-fs-filename
) as Record<string, any>;
