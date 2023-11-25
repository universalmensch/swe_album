import fs from 'node:fs';
import fsExtra from 'fs-extra';
import path from 'node:path';

const { existsSync, mkdirSync } = fs;
const { copySync } = fsExtra;
const { join } = path;

// BEACHTE: "assets" innerhalb von nest-cli.json werden bei "--watch" NICHT beruecksichtigt
// https://docs.nestjs.com/cli/monorepo#global-compiler-options

const src = 'src';
const dist = 'dist';
if (!existsSync(dist)) {
    mkdirSync(dist);
}

// DB-Skripte, EM-Dateien fuer TLS und JWT sowie GraphQL-Schema kopieren
const resourcesSrc = join(src, 'config', 'resources');
const resourcesDist = join(dist, src, 'config', 'resources');
mkdirSync(resourcesDist, { recursive: true });
copySync(resourcesSrc, resourcesDist);
